import { GetStaticProps } from 'next';
import Link from 'next/link';
import { ReactElement, useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import { formatDate } from '../utils/formatDate';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): ReactElement {
  const [postPage, setPostPage] = useState(postsPagination);

  async function handleNextPage(): Promise<void> {
    fetch(postPage.next_page)
      .then(response => response.json())
      .then((data: PostPagination) => {
        setPostPage({
          next_page: data.next_page,
          results: [...postPage.results, ...data.results],
        });
      });
  }

  return (
    <main className={styles.container}>
      <img src="/Logo.svg" alt="logo" />
      <div className={styles.posts}>
        {postPage.results.map(post => (
          <div className={styles.post} key={post.uid}>
            <Link href={`/post/${post.uid}`}>
              <a>
                <strong>{post.data.title}</strong>
                <p className={styles.subtitle}>{post.data.subtitle}</p>

                <div className={styles.info}>
                  <div>
                    <FiCalendar size={20} />
                    <time>{formatDate(post.first_publication_date)}</time>
                  </div>

                  <div>
                    <FiUser size={20} />
                    <p>{post.data.author}</p>
                  </div>
                </div>
              </a>
            </Link>
          </div>
        ))}
      </div>

      {postPage.next_page && (
        <div onClick={handleNextPage} className={styles.nextPage}>
          <a>Carregar mais posts</a>
        </div>
      )}
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts');

  return {
    props: {
      postsPagination: postsResponse,
    },
  };
};
