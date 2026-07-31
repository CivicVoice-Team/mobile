export type Tag = {
  name: string;
  type: string;
  icon: string;
  color: string;
  link: string;
};

export type LocationItem = {
  location_id: string;
  skill_id: string;
  title: string;
  about: string;
  address: string;
  hours: string;
  phone: string;
  homophones: string[];
  tags: Tag[];
};