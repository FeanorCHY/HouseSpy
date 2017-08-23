# -*- coding: utf-8 -*-
import scrapy




class CraigslistSpider(scrapy.Spider):
    name = "craigslist"
    allowed_domains = []
    start_urls = ['https://pittsburgh.craigslist.org/search/apa?query=pittsburgh']

    def parse(self, response):
        apt_urls = response.css(".result-info a.hdrlnk::attr('href')").extract()
        for apt_url in apt_urls:
            yield scrapy.Request(url=response.urljoin(apt_url),callback=self.parse_apartment)

        next_url = response.css("a.button.next::attr('href')").extract_first()
        if next_url:
            yield scrapy.Request(url=response.urljoin(next_url), callback=self.parse)

    def parse_apartment(self,response):
        self.logger.info(response.url)
        yield {}