import type { MorningClient } from "../client";
import type { City, Country, ExchangeRate, MorningLang, Occupation } from "../types";

export class ReferenceResource {
  constructor(private readonly client: MorningClient) {}

  /** GET cache /businesses/v1/occupations */
  occupations(locale: MorningLang = "he"): Promise<Occupation[]> {
    return this.client.cacheGet<Occupation[]>("/businesses/v1/occupations", { locale });
  }

  /** GET cache /geo-location/v1/countries */
  countries(locale: MorningLang = "he"): Promise<Country[]> {
    return this.client.cacheGet<Country[]>("/geo-location/v1/countries", { locale });
  }

  /** GET cache /geo-location/v1/cities */
  cities(country: string, locale: MorningLang = "he"): Promise<City[]> {
    return this.client.cacheGet<City[]>("/geo-location/v1/cities", { locale, country });
  }

  /** GET cache /currency-exchange/v1/latest */
  exchangeRates(base: string = "ILS"): Promise<ExchangeRate> {
    return this.client.cacheGet<ExchangeRate>("/currency-exchange/v1/latest", { base });
  }
}
