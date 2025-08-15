import ProductCard from "@/components/shared/product/product-card";
import { Button } from "@/components/ui/button";
import { getAllCategories, getAllProducts } from "@/lib/actions/product.actions";
import { cn } from "@/lib/utils";
import Link from "next/link";

export async function generateMetadata(props: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    price?: string;
    rating?: string;
    sort?: string;
    page?: string;
  }>
}) {
  const {
    q = 'all',
    category = 'all',
    price = 'all',
    rating = 'all',
  } = await props.searchParams;

  const isQuerySet = q && q !== 'all' && q.trim() !== '';
  const isCategorySet = category && category !== 'all' && category.trim() !== '';
  const isPriceSet = price && price !== 'all' && price.trim() !== '';
  const isRatingSet = rating && rating !== 'all' && rating.trim() !== '';

  if (isQuerySet || isCategorySet || isPriceSet || isRatingSet) {
    return {
      title: `
        ${isQuerySet ? `Search ${q}` : ''}
        ${isCategorySet ? `Category ${category}` : ''}
        ${isPriceSet ? `Price ${price}` : ''}
        ${isRatingSet ? `Rating ${rating}` : ''}
      `
    };
  }

  return {
    title: 'Search Products',
  };
};

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    price?: string;
    rating?: string;
    sort?: string;
    page?: string;
  }>
};

const prices = [
  {
    name: '$1 to $50',
    value: '1-50',
  },
  {
    name: '$51 to $100',
    value: '51-100',
  },
  {
    name: '$101 to $200',
    value: '101-200',
  },
  {
    name: '$201 to $500',
    value: '201-500',
  },
  {
    name: '$501 to $1000',
    value: '501-1000',
  }
];

const ratings = [4, 3, 2, 1];

const sortOrders = [
  'newest',
  'lowest',
  'highest',
  'rating',
];

const SearchPage = async ({ searchParams }: SearchPageProps) => {
  const {
    q = 'all',
    category = 'all',
    price = 'all',
    rating = 'all',
    sort = 'newest',
    page = '1',
  } = await searchParams;

  const getFilterUrl = ({
    c,
    p,
    s,
    r,
    pg,
  }: {
    c?: string;
    p?: string;
    s?: string;
    r?: string;
    pg?: string;
  }) => {
    const params = { q, category, price, rating, sort, page };

    if (c) {
      params.category = c;
    }

    if (p) {
      params.price = p;
    }

    if (s) {
      params.sort = s;
    }

    if (r) {
      params.rating = r;
    }

    if (pg) {
      params.page = pg;
    }

    return `/search?${new URLSearchParams(params).toString()}`;
  };

  const products = await getAllProducts({
    query: q,
    category,
    price: price,
    rating,
    sort,
    page: Number(page),
  });
  const categories = await getAllCategories();

  return (
    <div className="grid md:grid-cols-5 md:gap-5 mt-8">
      <div className="filter-links">
        <div className="text-xl mb-2 mt-3">
          Department
        </div>
        <div>
          <ul className="space-y-1">
            <li>
              <Link href={getFilterUrl({ c: 'all' })} className={category === 'all' || category === '' ? 'font-bold' : ''}>
                Any
              </Link>
            </li>
            {categories.map(x => (
              <li key={x.category}>
                <Link href={getFilterUrl({ c: x.category })} className={category === x.category ? 'font-bold' : ''}>
                  {x.category}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-xl mb-2 mt-8">
          Price
        </div>
        <div>
          <ul className="space-y-1">
            <li>
              <Link href={getFilterUrl({ p: 'all' })} className={price === 'all' || price === '' ? 'font-bold' : ''}>
                Any
              </Link>
            </li>
            {prices.map(x => (
              <li key={x.value}>
                <Link href={getFilterUrl({ p: x.value })} className={price === x.value ? 'font-bold' : ''}>
                  {x.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-xl mb-2 mt-8">
          Rating
        </div>
        <div>
          <ul className="space-y-1">
            <li>
              <Link href={getFilterUrl({ r: 'all' })} className={rating === 'all' || rating === '' ? 'font-bold' : ''}>
                Any
              </Link>
            </li>
            {ratings.map(r => (
              <li key={r}>
                <Link href={getFilterUrl({ r: r.toString() })} className={rating === r.toString() ? 'font-bold' : ''}>
                  {r} stars & up
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="md:col-span-4 space-y-4">
        <div className="flex-between flex-col md:flex-row my-4">
          <div className="flex items-center">
            {q !== 'all' && q !== '' && `Query: ${q}`} {' '}
            {category !== 'all' && category !== '' && `Category: ${category}`} {' '}
            {price !== 'all' && price !== '' && `Price: ${price}`} {' '}
            {rating !== 'all' && rating !== '' && `Rating: ${rating} stars & up`} {' '}
            &nbsp;
            {
              (q !== 'all' && q !== '')
              || (category !== 'all' && category !== '')
              || (price !== 'all' && price !== '')
              || (rating !== 'all' && rating !== '') ? (
                <Button variant={'link'} asChild>
                  <Link href={'/search'}>Clear</Link>
                </Button>
              ) : (
                null                
              )
            }
          </div>
          <div>
            Sort by:{' '}
            {sortOrders.map(s => (
              <Link key={s} className={cn('mx-2', sort === s && 'font-bold')} href={getFilterUrl({ s })}>
                {s}
              </Link>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {products.data.length === 0 ? (
            <div>
              No products found
            </div>
          ) : (
            <>
              {products.data.map(product => (
                <ProductCard product={product} key={product.id} />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
 
export default SearchPage;
