import { redirect } from "next/navigation";

type RepoRedirectProps = {
  params: { owner: string; repo: string };
};

export default function RepoRedirect({ params }: RepoRedirectProps) {
  redirect(`/repositories/${params.owner}/${params.repo}`);
}
