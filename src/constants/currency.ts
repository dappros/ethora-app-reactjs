export enum CurrencySymbol {
  USD = "$",
  EUR = "€",
  GBP = "£",
  JPY = "¥",
};

export const getCurrencySymbol = (currency: string): string => {
  return CurrencySymbol[currency.toUpperCase() as keyof typeof CurrencySymbol] || "Unknown currency";
};