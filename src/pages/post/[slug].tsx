import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { ReactElement } from 'react';
import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

import Header from '../../components/Header';
import { formatDate } from '../../utils/formatDate';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): ReactElement {
  const router = useRouter();

  function estimatedReadingTime(): string {
    const numberOfWords = post.data.content.reduce(
      (allSections, section) =>
        allSections + RichText.asText(section.body).split(' ').length,
      0
    );

    const wordsPerMinute = 200;

    return `${Math.ceil(numberOfWords / wordsPerMinute)} min`;
  }

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <Header />
      <img
        className={styles.banner}
        src={post.data.banner.url ?? ''}
        alt="banner"
      />

      <div className={styles.content}>
        <h1>{post.data.title}</h1>

        <div className={styles.info}>
          <div>
            <FiCalendar />
            <p>{formatDate(post.first_publication_date)}</p>
          </div>
          <div>
            <FiUser />
            <p>{post.data.author}</p>
          </div>
          <div>
            <FiClock />
            <p>{estimatedReadingTime()}</p>
          </div>
        </div>

        <div className={styles.postContent}>
          {post.data.content.map(section => (
            <section>
              <h2>{section.heading}</h2>

              <div
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(section.body),
                }}
              />
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts');

  const paths = posts.results.reduce(
    (prev, post) => [...prev, { params: { slug: post.uid } }],
    []
  );

  return { paths, fallback: true };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', String(slug));

  return {
    props: {
      post: response,
    },
  };
};
