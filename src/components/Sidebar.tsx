import { useEffect, useRef, type FC } from 'react';
import {
  ROOT_FALLBACK_CATEGORY,
  type GenerateSidebarResponse,
} from '@utils/generateSidebarDS';
import { generateSlug } from '@utils/url';
import clsx from 'clsx';
import { useMediaQuery } from '@hooks/useMediaQuery';
import { down } from '@utils/screens';
import { scrollToActiveItem } from '@utils/menu';

interface Props {
  data: GenerateSidebarResponse;
  pathname: string;
}

const findBase = (splitted: string[]) => {
  if (splitted[0] === '/docs') return ROOT_FALLBACK_CATEGORY;

  if (splitted.length === 1) {
    return 'docs';
  }

  return splitted[1];
};

const SidebarMenu: FC<Props> = ({ data, pathname }) => {
  const splitted = pathname.split('/').filter(Boolean);
  const activeCategory = splitted.length > 2 ? splitted[1] : findBase(splitted);
  const activeSlug =
    splitted.length > 2
      ? splitted[2]
      : splitted.length === 2
        ? splitted[1]
        : splitted[0];
  const isHome = activeSlug === 'docs';
  const isActiveCategory = (category: string) => category === activeCategory;
  const isActiveSlug = (slug: string) => slug === activeSlug;
  const activeItemStyle = 'font-bold !opacity-100';
  let isOpen = true;
  const isMd = useMediaQuery(down('md'));

  useEffect(() => {
    scrollToActiveItem({
      container: '.scrollable-menu',
      item: '.active-menu-item',
    });
  }, [activeSlug, activeCategory]);

  return (
    <ul className="mb-[150px]">
      <li className="">
        <a
          href="/docs"
          className={clsx(
            `font-plex-sans text-16  leading-loose opacity-80 transition duration-150 hover:opacity-100`,
            isHome && `${activeItemStyle} active-menu-item`,
          )}
        >
          Getting started
        </a>
      </li>

      {data.map((item, idx) => {
        if (item.category === ROOT_FALLBACK_CATEGORY) {
          return (
            <li key={`${idx}-${item.slug}`}>
              <a
                href={`/docs/${item.slug}`}
                className={clsx(
                  'rounded-lg block w-full py-2 font-plex-sans text-16 leading-loose opacity-80 transition duration-150 hover:opacity-100',
                  isActiveSlug(item.slug) &&
                    `${activeItemStyle} active-menu-item`,
                )}
              >
                {item.title}
              </a>
            </li>
          );
        }

        if (item.category !== ROOT_FALLBACK_CATEGORY) {
          isOpen = isMd ? item.category === activeCategory : true;
          return (
            <li key={`${idx}-${item.slug}`}>
              <details
                className="group [&_summary::-webkit-details-marker]:hidden"
                open={isOpen}
              >
                <summary className="rounded-lg hover hover flex cursor-pointer items-center justify-between py-2">
                  <a
                    className={`inline-block w-full font-plex-sans text-16 capitalize leading-loose text-gray-dark-11 transition duration-150 hover:opacity-100 ${
                      isActiveSlug(item.slug) && isActiveCategory(item.category)
                        ? `${activeItemStyle} active-menu-item`
                        : 'opacity-80'
                    }`}
                    href={`/docs/${item.slug}`}
                  >
                    <span data-menu-item={`${generateSlug(item.slug)}`}>
                      {item.title}
                    </span>
                  </a>

                  <span className="shrink-0 opacity-60 transition duration-300 hover:opacity-100 group-open:rotate-90 group-open:opacity-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={20}
                      height={20}
                      fill="none"
                    >
                      <path
                        fill="#fff"
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 0 1 0-1.414L10.586 10 7.293 6.707a1 1 0 1 1 1.414-1.414l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414 0Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </summary>

                <ul className="mt-2 space-y-1 border-l border-ui-dark-grey pl-20">
                  {item.list.map((sItem, idx) => (
                    <li key={`${idx}-${item.slug}`}>
                      <a
                        href={`/docs/${item.category}/${!sItem.index ? sItem.slug : ''}`}
                        className={`rounded-lg inline-block w-full py-2 font-plex-sans text-16 leading-loose transition duration-150 hover:opacity-100 ${isActiveCategory(item.category) && isActiveSlug(sItem.slug) ? 'active-menu-item font-bold opacity-100' : 'opacity-80'}`}
                      >
                        <span data-menu-item={`${generateSlug(sItem.title)}`}>
                          {sItem.title}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          );
        }
      })}
    </ul>
  );
};

export default SidebarMenu;
