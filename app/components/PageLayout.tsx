import {Await, Link} from '@remix-run/react';
import {Suspense, useId, useState} from 'react';
import type {
  CartApiQueryFragment,
  FooterQuery,
  HeaderQuery,
} from 'storefrontapi.generated';
import {Aside} from '~/components/Aside';
import {Header, HeaderMenu} from '~/components/Header';
import { PopUpContext } from '../../contexts/PopupContext';
import { ProductContext } from 'contexts/ProductContext';
import { ProductListContext } from 'contexts/ProductListContext'
import { ProductModalContext } from 'contexts/ProductFormContext'
import { Product } from './ProductCard';
interface PageLayoutProps {
  cart: Promise<CartApiQueryFragment | null>;
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
  children?: React.ReactNode;
}

export function PageLayout({
  cart,
  children = null,
  footer,
  header,
  isLoggedIn,
  publicStoreDomain,
}: PageLayoutProps) {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isProductFormModalOpen, setIsProductFormModalOpen] = useState<boolean>(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [productList, setProductList] = useState<Product[] | null>(null);

  return (
    <div className='relative'>
      <Aside.Provider>
        <PopUpContext.Provider value={{ isModalOpen, setIsModalOpen}}>
        <ProductContext.Provider value={{ product, setProduct }}>
        <ProductListContext.Provider value={{ productList, setProductList }}>
        <ProductModalContext.Provider value={{ isProductFormModalOpen, setIsProductFormModalOpen }}>
        <MobileMenuAside header={header} publicStoreDomain={publicStoreDomain} />
        <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
        {header && (
            <Header
              header={header}
              cart={cart}
              isLoggedIn={isLoggedIn}
              publicStoreDomain={publicStoreDomain}
            />
          )}
        </div>
        <main className="pt-[var(--header-height)]">
  {children}
</main>
        </ProductModalContext.Provider>
        </ProductListContext.Provider>
        </ProductContext.Provider>
        </PopUpContext.Provider>
      </Aside.Provider>
    </div>
  );
}



function MobileMenuAside({
  header,
  publicStoreDomain,
}: {
  header: PageLayoutProps['header'];
  publicStoreDomain: PageLayoutProps['publicStoreDomain'];
}) {
  return (
    header.menu &&
    header.shop.primaryDomain?.url && (
      <Aside type="mobile" heading="MENU">
        <HeaderMenu
          menu={header.menu}
          viewport="mobile"
          primaryDomainUrl={header.shop.primaryDomain.url}
          publicStoreDomain={publicStoreDomain}
        />
      </Aside>
    )
  );
}
