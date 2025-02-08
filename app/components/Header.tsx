import {Suspense} from 'react';
import {Await, NavLink, useAsyncValue} from '@remix-run/react';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
}: HeaderProps) {
  const {shop, menu} = header;

  // return (
  //   <header className="header">
  //     <NavLink prefetch="intent" to="/" style={activeLinkStyle} end>
  //       <strong>{shop.name}</strong>
  //     </NavLink>
  //     <HeaderMenu
  //       menu={menu}
  //       viewport="desktop"
  //       primaryDomainUrl={header.shop.primaryDomain.url}
  //       publicStoreDomain={publicStoreDomain}
  //     />
  //     <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
  //   </header>
  // );

  return(
    <div className='w-full z-40 flex py-2.5 px-5 transition-all duration-300 items-center'> 
      <NavLink to="/">
        <h1 className='text-xl font-semibold '>ContractualStore</h1>
      </NavLink>
      
      {/* Mobile Nav */}
       <HeaderMenuMobileToggle />

      {/* Desktop Nav */}
      <HeaderMenu
        viewport="desktop"
        primaryDomainUrl={header.shop.primaryDomain.url}
        publicStoreDomain={publicStoreDomain}
      />
    </div>
  )
}

export function HeaderMenu({
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}: {
  // menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  viewport: Viewport;
  publicStoreDomain: HeaderProps['publicStoreDomain'];
}) {
  const className = `header-menu-${viewport}`;
  const {close} = useAside();

  const baseClassName = "transition-all duration-200 hover:text-amber-400 font-source relative after:content-[''] after:absolute after:abolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:text-amber-400 after:transition-all after:duration-300 hover:after:w-full"
  const desktopClassName = "flex items-center justify-center space-x-12 text-sm uppercase tracking-wider"
  const mobileClassName = "flex flex-col px-6"
  const menuItems = {
    items: [
      {
        id: 'gid://shopify/MenuItem/461609500728',
        resourceId: null,
        tags: [],
        title: 'Inventory',
        type: 'HTTP',
        url: '/inventory',
        items: [],
      },
      {
        id: 'gid://shopify/MenuItem/461609533496',
        resourceId: null,
        tags: [],
        title: 'Products',
        type: 'HTTP',
        url: '/products/',
        items: [],
      }
    ]
  }

  return(
    <nav 
      className={`${viewport === 'desktop' ? desktopClassName : mobileClassName}`}
      role="navigation"
    >
      {viewport === 'mobile' && (
        <NavLink
          end
          onClick={close}
          prefetch="intent"
          className={({ isActive }) => `${baseClassName} ${isActive ? 'text-amber-400' : ''}`}
          to="/"
        >
          Home
        </NavLink>
      )}
      
      {(menuItems || FALLBACK_HEADER_MENU).items.map((item) => {
        if (!item.url) return null;

        const url = item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;

        return (
          <NavLink
            className={({ isActive }) => `${baseClassName} ${isActive ? 'text-amber-400' : ''}`}
            end
            key={item.id}
            onClick={close}
            prefetch="intent"
            to={url}
          >
            {item.title}
          </NavLink>
        );
      })}

      <div>
        {/* <HeaderCtas/> */}
      </div>
    </nav>
  );
}

function HeaderCtas({
  // isLoggedIn,
  // cart,
}
// : Pick<HeaderProps, 'isLoggedIn' | 'cart'>
) 
{
  return (
    <nav className="header-ctas" role="navigation">
      <HeaderMenuMobileToggle />
      <NavLink prefetch="intent" to="/account" style={activeLinkStyle}>
        <Suspense fallback="Sign in">
          {/* <Await resolve={isLoggedIn} errorElement="Sign in">
            {(isLoggedIn) => (isLoggedIn ? 'Account' : 'Sign in')}
          </Await> */}
        </Suspense>
      </NavLink>
      <SearchToggle />
      {/* <CartToggle cart={cart} /> */}
    </nav>
  );
}

function  HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      className="p-2 -mt-1.5 hover:text-amber-400 transition-colors duration-300"
      onClick={() => open('mobile')}
    >
      <h3 className='text-xl'>☰</h3>
    </button>
  );
}

function SearchToggle() {
  const {open} = useAside();
  return (
    <button className="reset" onClick={() => open('search')}>
      Search
    </button>
  );
}

function CartBadge({count}: {count: number | null}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <a
      href="/cart"
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
    >
      Cart {count === null ? <span>&nbsp;</span> : count}
    </a>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};

function activeLinkStyle({
  isActive,
  isPending,
}: {
  isActive: boolean;
  isPending: boolean;
}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'black',
  };
}
