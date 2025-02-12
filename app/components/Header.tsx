import { Suspense } from 'react';
import {  NavLink,  } from '@remix-run/react';
import type { HeaderQuery, CartApiQueryFragment } from 'storefrontapi.generated';
import { useAside } from '~/components/Aside';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

export function Header({
  header,
  publicStoreDomain,
}: HeaderProps) {
  const {shop} = header;

  return (
    <header className="w-full z-40 flex py-2.5 px-5 transition-all duration-300 items-center justify-between"> 
      {/* Logo */}
      <NavLink to="/">
        <h1 className='text-xl font-semibold '>ContractualStore</h1>
      </NavLink>

      {/* Mobile View: Only show Hamburger Menu */}
      <div className="block lg:hidden">
        <HeaderMenuMobileToggle />
      </div>

      {/* Desktop View: Show full navigation */}
      <div className="hidden lg:flex items-center space-x-12">
        <HeaderMenu
          viewport="desktop"
          primaryDomainUrl={header.shop.primaryDomain.url}
          publicStoreDomain={publicStoreDomain}
        />
      </div>
    </header>
  );
}


export function HeaderMenu({
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}: {
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  viewport: Viewport;
  publicStoreDomain: HeaderProps['publicStoreDomain'];
}) {
  const className = `header-menu-${viewport}`;
  const { close } = useAside();

  const baseClassName =
    "transition-all duration-200 hover:text-amber-400 font-source relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:text-amber-400 after:transition-all after:duration-300 hover:after:w-full";
  const desktopClassName = "flex items-center justify-center space-x-12 text-sm uppercase tracking-wider";
  const mobileClassName = "flex flex-col px-6";

  const menuItems = {
    items: [
      { id: '1', title: 'Inventory', url: '/inventory' },
      // { id: '2', title: 'Products', url: '/products/' }, 
    ],
  };

  return (
    <nav className={viewport === 'desktop' ? desktopClassName : mobileClassName} role="navigation">
      {viewport === 'mobile' && (
        <NavLink end onClick={close} prefetch="intent" className={baseClassName} to="/">
          Home
        </NavLink>
      )}

      {menuItems.items.map((item) => (
        <NavLink
          key={item.id}
          className={baseClassName}
          end
          onClick={close}
          prefetch="intent"
          to={item.url}
        >
          {item.title}
        </NavLink>
      ))}
    </nav>
  );
}

function HeaderCtas() {
  return (
    <nav className="header-ctas" role="navigation">
      <NavLink prefetch="intent" to="/account" style={activeLinkStyle}>
        <Suspense fallback="Sign in">
          {/* Authentication logic can go here */}
        </Suspense>
      </NavLink>
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  const { open } = useAside();
  return (
    <button className="p-2 -mt-1.5 hover:text-amber-400 transition-colors duration-300" onClick={() => open('mobile')}>
      <h3 className="text-xl">☰</h3>
    </button>
  );
}

const activeLinkStyle = ({ isActive, isPending }: { isActive: boolean; isPending: boolean }) => ({
  fontWeight: isActive ? 'bold' : undefined,
  color: isPending ? 'grey' : 'black',
});
