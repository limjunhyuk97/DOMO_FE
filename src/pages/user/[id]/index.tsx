import Link from 'next/link';
import Image from 'next/image';
import { css } from '@emotion/react';
import { useMemo } from 'react';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';

import { bpmax } from '@/libs/styles/constants';
import MDEditor from '@uiw/react-md-editor';
import client from '@/api/client';

import useUser from '@/hooks/user/useUser';
import { assert } from '@/libs/utils/assert';
import {
  GithubUpdateStatusResponse,
  UserDetailInfoResponse,
} from '@/libs/type/client';

import Keyword from '@/components/Keyword';
import Stack from '@/components/Stack';
import { colors } from '@/components/constant/color';
import ProjectWrapper from '@/components/Projects/ProjectWrapper';
import ProjectCard from '@/components/Projects/ProjectCard';
import { safeLocalStorage } from '@toss/storage';
import { queryKey } from '@/libs/constant';
import useSnackBar from '@/hooks/useSnackBar';

export const getServerSideProps = (async (ctx) => {
  const id = ctx.params?.id as string;
  assert(id, "Can't not find ID.");

  const user = await client.userDetail({
    user_id: id,
  });
  assert(user, 'Invalid user.');

  const github_status = await client.gitHubUpdateStatus({
    user_id: id,
  });
  assert(github_status, 'Invalid Github Status.');

  return {
    props: { user, id, github_status },
  };
}) satisfies GetServerSideProps<{
  id: string;
  user: UserDetailInfoResponse;
  github_status: GithubUpdateStatusResponse;
}>;

export default function Profile({
  id,
  user,
  github_status,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const token = safeLocalStorage.get(queryKey.USER_ACCESS_TOKEN);
  const { openSnackBar } = useSnackBar();
  const { user: loggedInUser } = useUser();
  const isOwn = useMemo(() => {
    return loggedInUser && loggedInUser.email === user.email;
  }, [loggedInUser, user]);

  return (
    <div
      css={css`
        background-color: ${colors.white};
        width: 896px;
        margin: 0 auto;
        padding: 2rem;
        display: flex;
        flex-direction: column;
        gap: 24px;
        ${bpmax[2]} {
          width: 100%;
          box-sizing: border-box;
          padding: 2rem 0.5rem;
        }
      `}
    >
      <div
        css={css`
          display: flex;
          position: relative;
          justify-content: space-between;
          align-items: center;
        `}
      >
        <div
          css={css`
            display: flex;
            justify-content: center;
            align-items: center;

            gap: 10px;
          `}
        >
          <Image
            width={164}
            height={164}
            src={
              user?.profile_image_link && user?.profile_image_updated_at
                ? `${user?.profile_image_link}?timestamp=${user?.profile_image_updated_at}`
                : '/profile.jpg'
            }
            alt="profile"
            css={css`
              border-radius: 9999px;
              width: 164px;
              height: 164px;
              object-fit: cover;
              ${bpmax[1]} {
                width: 96px;
                height: 96px;
              }
            `}
          />
          <span
            css={css`
              font-size: 1.5rem;
              font-weight: 400;
              color: ${colors.grey700};
            `}
          >
            {user?.short_description ?? '아직 한 줄 소개가 비어있어요!'}
          </span>
        </div>
        {isOwn ? (
          <div>
            {user.github_link ? (
              <button
                onClick={async () => {
                  if (!token) return;
                  const res = await client.gitHubManualUpdate({ token });
                  if (res?.ok)
                    return openSnackBar('업데이트가 요청되었습니다.');
                  return openSnackBar('업데이트를 실패했습니다.');
                }}
                css={css`
                  border: none;
                  outline: none;
                  background: none;

                  color: ${colors.white};
                  font-weight: 600;

                  font-size: 1rem;

                  margin-right: 10px;

                  cursor: pointer;

                  background-color: ${colors.black};
                  border-radius: 4px;
                  padding: 12px 16px;

                  transition: background-color 0.2s ease;

                  ${bpmax[1]} {
                    padding: 8px 12px;
                  }

                  &:hover {
                    background-color: ${colors.grey800};
                  }
                `}
                type="button"
              >
                GitHub 업데이트
              </button>
            ) : null}
            <Link
              href={`/user/Update?id=${id}`}
              css={css`
                color: black;
                outline: none;
                text-decoration: none;
                border-radius: 4px;

                font-size: 1rem;

                font-weight: 600;
                border: 1px solid #e0e0e0;
                padding: 12px 16px;
                ${bpmax[1]} {
                  padding: 8px 12px;
                }
              `}
            >
              편집
            </Link>
          </div>
        ) : null}
      </div>

      {/* details */}
      <div
        css={css`
          display: flex;
          width: 100%;
          align-items: flex-start;
          justify-content: space-between;
        `}
      >
        {/* name */}
        <h2
          css={css`
            font-weight: 600;
            font-size: 36px;

            ${bpmax[1]} {
              font-size: 28px;
            }
          `}
        >
          {user?.name}
        </h2>
        <div
          css={css`
            display: flex;
            flex-direction: column;
            gap: 5px;
          `}
        >
          {/* email */}
          <div
            css={css`
              display: flex;
              align-items: center;
              gap: 1rem;
              font-size: 16px;
            `}
          >
            <img
              src="/mail.png"
              css={css`
                width: 24px;
                object-fit: cover;
              `}
            />
            <h2
              css={css`
                text-decoration: none;
              `}
            >
              {user?.email}
            </h2>
          </div>
          {/* github_link */}
          {user.github_link ? (
            <div
              css={css`
                display: flex;
                align-items: center;
                gap: 1rem;
                font-size: 16px;
              `}
            >
              <img
                src="/github.png"
                css={css`
                  width: 24px;
                  object-fit: cover;
                `}
              />
              <h2
                css={css`
                  text-decoration: none;
                `}
              >
                {user?.github_link}
              </h2>
            </div>
          ) : null}
        </div>
      </div>
      <div
        css={css`
          width: 100%;
          height: 2px;
          background-color: #cdcdcd;
        `}
      />
      {/* description */}
      <div data-color-mode="light">
        {user.description ? (
          <MDEditor.Markdown source={user.description} />
        ) : (
          <div
            css={css`
              position: relative;
              min-height: 300px;
              width: 100%;
              margin-bottom: 1.5rem;

              display: flex;

              justify-content: center;
              align-items: center;

              gap: 10px;

              background-color: ${colors.grey50};
              border: 1px solid ${colors.grey200};
            `}
          >
            <h2
              css={css`
                color: ${colors.black};
                text-decoration: none;
                font-size: 2rem;
                font-weight: bold;
              `}
            >
              아직 자기소개가 비어있어요!
            </h2>
          </div>
        )}
      </div>
      <div
        css={css`
          display: flex;
          flex-direction: column;
        `}
      >
        <Stack status={github_status.status} />
        <Keyword status={github_status.status} />
      </div>
      <h1
        css={css`
          font-size: 2rem;
          font-weight: bold;

          padding: 0.5rem 0;
          border-bottom: 2px solid #e0e0e0;
        `}
      >
        프로젝트
      </h1>
      <ProjectWrapper>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((el) => (
          <ProjectCard id={el} />
        ))}
      </ProjectWrapper>
    </div>
  );
}
