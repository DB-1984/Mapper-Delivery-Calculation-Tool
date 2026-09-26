export type DeliveryBand = {
  underMiles: number;
  price: number;
};

export type DeliveryResult = {
  destination: string;
  distanceMiles: number;
  deliveryPrice: number | null;
  m25CheckRequired: boolean;
};

export type SelectedLocation = {
  postcode: string;
  address: string;
  lat: number;
  lng: number;
};