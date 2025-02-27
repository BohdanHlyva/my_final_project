export interface IProduct{
    id: number;
    category: string;
    subcategory: string;
    subcategoryEN: string,
    nameEN: string;
    nameUA: string;
    description: string;
    compability?: string;
    color?: string;
    secondColor?: string;
    material?: string;
    additional?: string;
    oldPrice?: number;
    price: number;
    top: boolean;
    sale: boolean;
    image: string;
    imageAdd?:string;
    statusWish: boolean;
    count: number;
}