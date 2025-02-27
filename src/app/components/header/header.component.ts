import { Component, OnInit } from '@angular/core';
import { fromEvent } from 'rxjs';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { CategoryService } from 'src/app/shared/services/category.service';
import { ICategory } from 'src/app/shared/interfaces/category.interface';
import { OrderService } from '../../shared/services/order.service';
import { IProduct } from 'src/app/shared/interfaces/product.interface';
import { ProductService } from 'src/app/shared/services/product.service';
import { BasketService } from '../../shared/services/basket.service';
import { AuthService } from '../../shared/services/auth.service';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  basket: Array<IProduct> = [];
  totalPrice: number;
  scrollStatus: boolean;
  openWishList: boolean;
  modalRef: BsModalRef;
  typeauth: string;
  categories: Array<ICategory> = [];
  myModal = document.getElementsByClassName('modal') as HTMLCollectionOf<HTMLElement>;
  myModalSearch = document.getElementsByClassName('search') as HTMLCollectionOf<HTMLElement>;

  firstName: string = '';
  lastName: string = '';
  phone: any;
  email: string = '';
  password: string = '';
  checkName = /[А-Яа-я]{2,20}/;
  checkEmail = /^[\w\.\-]{1,}@\w{1,}\.\w{2,7}$/;
  checkPhone = /^\d{10}$/;
  checkPassword: RegExp = /^[0-9A-Za-z]{8,}$/;
  statusLogin: boolean;
  urlName: string;
  menuName: string;
  userEmail: string;
  userName: string;
  userNameLast: string;
  userPhone: string;
  userOrder: any;
  userId: any;
  userRole: string;
  productsWish: Array<IProduct> = [];
  findUserID: any;
  hideBurger: boolean;
  searchProduct: string;
  allProducts: Array<IProduct> = [];
  productResult: Array<IProduct> = [];
  constructor(
    private catService: CategoryService,
    private orderService: OrderService,
    private productService: ProductService,
    private basketService: BasketService,
    private authService: AuthService,
    private afStorage: AngularFirestore
  ) {

  }

  ngOnInit(): void {
    this.adminFirebaseCategories();
    this.getAllProducts();
    this.getData();
    this.checkBasket();
    this.addNewProduct();
    this.scroll();
    this.other();
    this.updateCheckUser();
    this.checkUser();
    this.getWishProducts();
    this.getListwishProducts();
    
  }

  private adminFirebaseCategories(): void {
    this.catService.getFirecloudCategory().subscribe(
      collection => {
        this.categories = collection.map(category => {
          const data = category.payload.doc.data() as ICategory;
          const id = category.payload.doc.id;
          return { id, ...data };
        });
      }
    );
  }

  private getAllProducts(): void {
    this.afStorage.collection('products').ref.where('count', '==', 1).onSnapshot(
      collection => {
        collection.forEach(document => {
          const data = document.data() as IProduct;
          const id = document.id;
          this.allProducts.push({ id, ...data })
        })
      }
    )
  }

  private getWishProducts(): void {
    this.productService.productWish.subscribe(([product, status]) => {
      if (localStorage.length > 0 && localStorage.getItem('myProductWishes')) {
        this.productsWish = JSON.parse(localStorage.getItem('myProductWishes'));
        if (this.productsWish.some(prod => prod.id === product.id) || status == 'delete') {
          const index = this.productsWish.findIndex(prod => prod.id === product.id);
          this.productsWish.splice(index, 1);
        }
        else {
          this.productsWish.push(product);
        }
      }
      else {
        this.productsWish = [];
        this.productsWish.push(product)
      }
      localStorage.setItem('myProductWishes', JSON.stringify(this.productsWish));
    })
  }

  private getListwishProducts(): void {
    if (localStorage.length > 0 && localStorage.getItem('myProductWishes')) {
      this.productsWish = JSON.parse(localStorage.getItem('myProductWishes'));
    }
  }

  deleteProductWish(product): void {
    this.productService.productWish.next([product, 'delete'])
    this.productService.productWishUser.next('');
  }

  private addNewProduct(): void {
    this.orderService.basket.subscribe(() => {
      this.getData();
    })
  }

  private checkBasket(): void {
    this.basketService.allBasket.subscribe(() => {
      this.basket = this.basketService.getBasket()
      this.totalPrice = this.basketService.getTotal()
    })
  }

  private getData(): void {
    if (localStorage.length > 0 && localStorage.getItem('myOrder')) {
      this.basket = this.basketService.setBasket()
      this.totalPrice = this.basketService.setTotal()
    }
  }

  productCount(product: IProduct, status: boolean): void {
    this.basketService.productCount(product, status)
    this.orderService.basket.next('');
  }

  deleteProductBasket(product: IProduct): void {
    this.basketService.deleteProductBasketS(product)
  }

  private scroll(): void {
    let logo = document.getElementsByClassName('header_main_logo_img') as HTMLCollectionOf<HTMLElement>;
    let headerLiImg = document.getElementsByClassName('img_li') as HTMLCollectionOf<HTMLElement>
    for (let i = 0; i < headerLiImg.length; i++) {
      setTimeout(() => {
        headerLiImg[i].style.opacity = '1'
      }, 500 * i)
    }
    fromEvent(window, 'scroll').subscribe(() => {
      if (window.scrollY > window.innerWidth / 3.36 && window.innerWidth > 767) {
        this.scrollStatus = true
      }
      else {
        this.scrollStatus = false
      }
    })
    setTimeout(() => {
      logo[0].style.opacity = '1'
    }, 2400)
  }

  private other(): void {
    if (screen.width < 767) {
      window.addEventListener('click', (event: any) => {
        let eventCrossbrowser=event.path||event.composedPath()
        eventCrossbrowser[1].classList[0] == 'header_mobile_wishlist_ul' ||
        eventCrossbrowser[0].classList[0] == 'far'
          ? this.openWishList = true
          : this.openWishList = false
        let checkbox = document.querySelector("input[type=checkbox]:checked") as any
        if (checkbox) {
          eventCrossbrowser[1].id == 'menuToggle'
            ? checkbox.checked = true
            : checkbox.checked = false
        }
        eventCrossbrowser[1].id == 'myModal' || eventCrossbrowser[1].className == 'header_mobile_icon' || eventCrossbrowser[1].className == 'inputElementWrapperSearch' || eventCrossbrowser[1].className == 'modal-content' && eventCrossbrowser[0].className != 'close'
          ? this.myModalSearch[0].style.display = 'flex'
          : this.myModalSearch[0].style.display = 'none';
      })
    }
  }

  openModal(type: string): void {
    this.typeauth = type;
    this.myModal[0].style.display = 'flex';
  }
  openSearchModal(): void {
    this.myModalSearch[0].style.display = 'flex';
  }

  closeModal(): void {
    this.reset()
  }

  loginUser(): void {
    if (this.email != '' && this.password != '') {
      this.authService.signIn(this.email, this.password);
      this.reset()
    }
    else {
      alert('Заповніть усі поля')
    }
  }

  registerUser(): void {
    if (this.checkName.test(this.firstName)) {
      if (this.checkPhone.test(this.phone)) {
        if (this.checkEmail.test(this.email)) {
          if (this.checkPassword.test(this.password)) {
            this.authService.signUp(this.email, this.password, this.firstName, this.phone);
            this.reset();
          }
          else {
            alert('Пароль должен быть от 8 символов')
          }
        }
        else {
          alert('Некорректно указан емайл')
        }
      }
      else {
        alert('Некорректно указан телефон')
      }
    }
    else {
      alert('Некорректно указано имя')
    }
  }

  private updateCheckUser(): void {
    this.authService.userStatus.subscribe(
      () => {
        this.checkUser();
      }
    )
  }

  private checkUser(): void {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user != null) {
      if (user.role === 'admin') {
        this.urlName = 'admin';
        this.menuName = 'Админ'
        this.statusLogin = true;

      }
      else if (user.role === 'user') {
        this.urlName = 'profile';
        this.menuName = 'Кабинет'
        this.statusLogin = true;
      }
    }
    else {
      this.statusLogin = false;
      this.urlName = '';
      this.menuName = ''
    }
  }

  openWishMobile(): void {
    this.openWishList = !this.openWishList
  }
  searchProducts(): void {
    this.productResult = [];
    this.allProducts.filter(elem => {
      elem.nameUA.toLowerCase().includes(this.searchProduct.toLowerCase())
        ? this.productResult.push(elem)
        : elem
    })
    if (this.searchProduct == '') {
      this.productResult = [];
    }
  }

  reset(): void {
    this.myModal[0].style.display = 'none';
    this.myModalSearch[0].style.display = 'none';
    this.firstName = '';
    this.lastName = '';
    this.phone = undefined;
    this.email = '';
    this.password = '';
    this.productResult = [];
    this.searchProduct = ''
  }

}
