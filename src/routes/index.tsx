import {
  Form,
  ShouldRevalidateFunction,
  useLoaderData,
  useParams,
  useSearchParams,
} from '@remix-run/react';
import { LoaderArgs } from '@remix-run/server-runtime';
import Topics from '../components/Topics';
import BackToTop from '../components/BackToTop';
import Person from '../components/Person';
import { getPeople } from 'src/util/stats';

export async function loader({ params }: LoaderArgs) {
  const people = getPeople(params.tag);
  return {people};
}

export const shouldRevalidate: ShouldRevalidateFunction = ({
  currentUrl,
  nextUrl,
}) => {
  return Boolean(currentUrl.pathname !== nextUrl.pathname);
};

export default function Index() {
  const { people } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('query');
  const peopleFiltered = searchQuery
    ? people.filter((person) => {
        return (
          person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          person.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          person.url.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
    : people;
  const { tag: currentTag } = useParams();

  return (
    <>
      <Topics />
      <Form>
        <label htmlFor='search'>Search people</label>
        <input
          type='search'
          id='search'
          name='query'
          className='SearchInput'
          defaultValue={searchQuery || ''}
          onChange={(event) => {
            setSearchParams(
              { query: event.target.value },
              { preventScrollReset: true }
            );
          }}
        />
      </Form>
      <p>
        showing {peopleFiltered.length} of {people.length}{' '}
        {people.length === 1 ? 'person' : 'people'}{' '}
        {currentTag ? `in ${currentTag}` : ''}
      </p>
      <div className='People'>
        {peopleFiltered.map((person) => (
          <Person key={person.name} person={person} />
        ))}
      </div>
      <BackToTop />
    </>
  );
}
