import argparse
import html.parser
import multiprocessing
import pathlib
import requests

from urllib.parse import urlparse

MONTHLY_CLIMATE_DATA='https://dd.weather.gc.ca/climate/observations/monthly/csv/'


class ProvinceListParser(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.provinces_links = []

    def handle_starttag(self, tag, attrs):
        if tag == 'a':
            attr_name, value = attrs[0]
            if len(value) == 3:
                self.provinces_links.append(MONTHLY_CLIMATE_DATA + value)


class MonthlyDataParser(html.parser.HTMLParser):
    def __init__(self, root):
        super().__init__()
        self.root = root
        self.files_links = []

    def handle_starttag(self, tag, attrs):
        if tag == 'a':
            attr_name, value = attrs[0]

            if value.startswith('climate_monthly'):
                self.files_links.append(self.root + value)


def download_one_csv(url, output_dir):
    parsed_url = urlparse(url)
    path_to_file = pathlib.Path(parsed_url.path)
    print(path_to_file.stem)

    target_file = output_dir / path_to_file.name

    if not target_file.is_file():
        with open(target_file, 'w') as f:
            resp = requests.get(url)
            f.write(resp.text)


def download_one_province(province_url, target_directory):
    monthly_parser = MonthlyDataParser(province_url)
    resp = requests.get(province_url)

    parsed_url = urlparse(province_url)
    province_path = pathlib.Path(parsed_url.path)
    province_code = province_path.stem

    print(province_code)

    monthly_parser.feed(resp.text)
    print(monthly_parser.files_links)

    target_dir = target_directory / province_code
    if not target_dir.is_dir():
        target_dir.mkdir()

    with multiprocessing.Pool(16) as pool:
        pool.starmap(download_one_csv, [(x, target_dir) for x in monthly_parser.files_links])


def cli():
    parser = argparse.ArgumentParser()
    parser.add_argument('output', type=pathlib.Path, help='Where to download the data')
    args = parser.parse_args()

    resp = requests.get(MONTHLY_CLIMATE_DATA)

    html_parser = ProvinceListParser()
    html_parser.feed(resp.text)

    for link in html_parser.provinces_links:
        download_one_province(link, args.output)



if __name__ == '__main__':
    cli()
