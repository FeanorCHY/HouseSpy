# -*- coding: utf-8 -*-
import scrapy
import datetime
import sys
import re

UNKNOWN = "<UNKNOWN>"
CONCAT_STR=","

PATTERN_CLEAN_PRICE = re.compile(r"[\s$,]")
PATTERN_RANGE_PRICE = re.compile(r"(\d+)-(\d+)")
PATTERN_SINGLE_PRICE = re.compile(r"(\d+)")


def parse_price(price_str):
    price_str = re.sub(PATTERN_CLEAN_PRICE,"",price_str)
    match = PATTERN_RANGE_PRICE.match(price_str)
    if match:
        return int(match.group(1)),int(match.group(2))
    elif PATTERN_SINGLE_PRICE.match(price_str):
        return (int(price_str),)
    else:
        return (-1,);




class ApartmentSpider(scrapy.Spider):
    name = "apartment"
    allowed_domains = []
    start_urls = ['http://www.apartments.com/pittsburgh-pa/']

    def parse(self, response):
        root = response.css("#placardContainer")
        # crawl all apartment on current page
        for url in root.css(".placard::attr('data-url')").extract():
            yield scrapy.Request(url=url,callback=self.parse_apartment)
        # next page
        next_page_url = response.css(".next::attr('href')").extract_first()

        yield scrapy.Request(url=next_page_url,callback=self.parse)

    def parse_apartment(self, response):

            apartment_info = {}
            # basic info: name,description, address, contact
            headerTag = response.css("#profileHeaderWrapper #propertyHeader")
            name = headerTag.css("*[itemprop='name']::text").extract_first().strip()

            # address: some apartment has no explicit address, but we can extract and concat them together
            addressTag = response.css(".propertyAddress")
            address_infos = addressTag.css("span::text")

            address_text = CONCAT_STR.join(address_infos.extract())

            if len(addressTag.css(" *[itemprop]")) > 0:
                street = addressTag.css("*[itemprop='streetAddress']::text").extract_first(UNKNOWN).strip()
                city = addressTag.css("*[itemprop='addressLocality']::text").extract_first(UNKNOWN).strip()
                state = addressTag.css("*[itemprop='addressRegion']::text").extract_first(UNKNOWN).strip()
                zip_code = addressTag.css("*[itemprop='postalCode']::text").extract_first(UNKNOWN).strip()
            else:

                street = UNKNOWN
                city = UNKNOWN
                state = UNKNOWN
                zip_code = (address_infos.re_first(r"\s*\d{5}\s*") or UNKNOWN).strip()

            contact_phone = headerTag.css('*[itemprop="telephone"]::text').extract_first().strip()

            description = response.css("#descriptionSection *[itemprop='description']::text").extract_first().strip()

            # photos
            photos = response.css('.aspectRatioImage img::attr("src")').extract()

            # size
            apartmentTabTag = response.css(".availabilityTable")
            rentRowTags = apartmentTabTag.css(".rentalGridRow")
            sizes = []

            for row in rentRowTags:
                size = {
                    "bedroom" : row.css(".beds .longText::text").extract_first(UNKNOWN).strip(),
                    "bathroom" : row.css(".baths .longText::text").extract_first(UNKNOWN).strip(),
                    "deposit" : row.css(".deposit::text").extract_first(UNKNOWN).strip(),
                    "unit" : row.css(".unit::text").extract_first(UNKNOWN).strip(),
                    "area" : row.css(".sqft::text").extract_first(UNKNOWN).strip(),
                    "name" : row.css(".name::text").extract_first(UNKNOWN).strip(),
                    "is_available" : row.css(".available::text").extract_first(UNKNOWN).strip()

                }
                price = row.css(".rent::text").extract_first(UNKNOWN).strip()
                if price != UNKNOWN:
                    price = parse_price(price)
                    if len(price) > 1:
                        size["price"] = -1
                        size["price_range"] = price
                    else:
                        size["price"] = price[0]
                        size["price_range"] = []
                    sizes.append(size)
                else:
                    size["price"] = -1
                    size["price_range"] = []

            # amenitiesSection
            # amenitiesTag = response.css("#amenitiesSection")
            #
            # detailsTag = amenitiesTag.css("*[class*='Details']");

            amenity = {}

            # for detailTag in detailsTag:
            #     detail_name = detailTag.xpath("@class")
            #     detail_text =  CONCAT_STR.join(detailTag.xpath(".//text()").re(r"\S+"))
            #
            #     amenity[detail_name] = detail_text
            #
            # _source info, help for debug
            source_infos = {
                "source_url":response.url,
                "crawl_time": str(datetime.datetime.now())
            }

            yield {
                "name":name,
                "description":description,
                "address":{
                    "street":street,
                    "city":city,
                    "state":state,
                    "zip_code":zip_code,
                    "text": address_text
                },
                "contact":{
                    "phone":contact_phone
                },
                "amenity":amenity,
                "other":[],
                "photos":photos,
                "sizes":sizes,
                "_source":source_infos
            }


list(ApartmentSpider().parse_apartment(response))