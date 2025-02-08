import {Await, Link} from '@remix-run/react';
import {Suspense, useId, useState} from 'react';
import type {
  CartApiQueryFragment,
  FooterQuery,
  HeaderQuery,
} from 'storefrontapi.generated';
import {Aside} from '~/components/Aside';
import {Footer} from '~/components/Footer';
import {Header, HeaderMenu} from '~/components/Header';
import {CartMain} from '~/components/CartMain';
import {
  SEARCH_ENDPOINT,
  SearchFormPredictive,
} from '~/components/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';
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
    <Aside.Provider>
      <PopUpContext.Provider value={{ isModalOpen, setIsModalOpen}}>
      <ProductContext.Provider value={{ product, setProduct }}>
      <ProductListContext.Provider value={{ productList, setProductList }}>
      <ProductModalContext.Provider value={{ isProductFormModalOpen, setIsProductFormModalOpen }}>
      <ProductAside />
      <MobileMenuAside header={header} publicStoreDomain={publicStoreDomain} />
      {header && (
        <Header
          header={header}
          cart={cart}
          isLoggedIn={isLoggedIn}
          publicStoreDomain={publicStoreDomain}
        />
      )}
      <main>{children}</main>
      <Footer
        footer={footer}
        header={header}
        publicStoreDomain={publicStoreDomain}
      />
      </ProductModalContext.Provider>
      </ProductListContext.Provider>
      </ProductContext.Provider>
      </PopUpContext.Provider>
    </Aside.Provider>
  );
}

// function CartAside({cart}: {cart: PageLayoutProps['cart']}) {
//   return (
//     <Aside type="cart" heading="CART">
//       <Suspense fallback={<p>Loading cart ...</p>}>
//         <Await resolve={cart}>
//           {(cart) => {
//             return <CartMain cart={cart} layout="aside" />;
//           }}
//         </Await>
//       </Suspense>
//     </Aside>
//   );
// }

function ProductAside() {
  return (
    <Aside type="product" heading="CART">
      <Suspense fallback={<p>Loading cart ...</p>}>
        {/* <Await resolve={cart}>
          {(cart) => {
            return <CartMain cart={cart} layout="aside" />;
          }}
        </Await> */}
      </Suspense>
    </Aside>
  );
}

// function SearchAside() {
//   const queriesDatalistId = useId();
//   return (
//     <Aside type="search" heading="SEARCH">
//       <div className="predictive-search">
//         <br />
//         <SearchFormPredictive>
//           {({fetchResults, goToSearch, inputRef}) => (
//             <>
//               <input
//                 name="q"
//                 onChange={fetchResults}
//                 onFocus={fetchResults}
//                 placeholder="Search"
//                 ref={inputRef}
//                 type="search"
//                 list={queriesDatalistId}
//               />
//               &nbsp;
//               <button onClick={goToSearch}>Search</button>
//             </>
//           )}
//         </SearchFormPredictive>

//         <SearchResultsPredictive>
//           {({items, total, term, state, closeSearch}) => {
//             const {articles, collections, pages, products, queries} = items;

//             if (state === 'loading' && term.current) {
//               return <div>Loading...</div>;
//             }

//             if (!total) {
//               return <SearchResultsPredictive.Empty term={term} />;
//             }

//             return (
//               <>
//                 <SearchResultsPredictive.Queries
//                   queries={queries}
//                   queriesDatalistId={queriesDatalistId}
//                 />
//                 <SearchResultsPredictive.Products
//                   products={products}
//                   closeSearch={closeSearch}
//                   term={term}
//                 />
//                 <SearchResultsPredictive.Collections
//                   collections={collections}
//                   closeSearch={closeSearch}
//                   term={term}
//                 />
//                 <SearchResultsPredictive.Pages
//                   pages={pages}
//                   closeSearch={closeSearch}
//                   term={term}
//                 />
//                 <SearchResultsPredictive.Articles
//                   articles={articles}
//                   closeSearch={closeSearch}
//                   term={term}
//                 />
//                 {term.current && total ? (
//                   <Link
//                     onClick={closeSearch}
//                     to={`${SEARCH_ENDPOINT}?q=${term.current}`}
//                   >
//                     <p>
//                       View all results for <q>{term.current}</q>
//                       &nbsp; →
//                     </p>
//                   </Link>
//                 ) : null}
//               </>
//             );
//           }}
//         </SearchResultsPredictive>
//       </div>
//     </Aside>
//   );
// }

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
