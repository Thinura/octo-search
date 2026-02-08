import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { vi } from "vitest";
import FavoritesList from "@/components/favorites/favorites-list";
import type { FavoriteItem } from "@/features/favorites/slice";
import { SEARCH_TYPES } from "@/lib/constants/search";

type MockUserCardProps = {
  user: { id: number; username: string };
  selectionControl?: ReactNode;
  entityType?: "org" | "user";
};

vi.mock("@/components/search/user-card", () => ({
  default: ({ user, selectionControl, entityType }: MockUserCardProps) => (
    <div
      data-testid={`user-card-${user.username}`}
      data-id={user.id}
      data-entity={entityType ?? "user"}
    >
      {selectionControl}
    </div>
  ),
  UserCardData: {},
}));

type MockRepoCardProps = {
  repo: { id: number; full_name: string };
  selectionControl?: ReactNode;
};

vi.mock("@/components/search/repo-card", () => ({
  default: ({ repo, selectionControl }: MockRepoCardProps) => (
    <div data-testid={`repo-card-${repo.full_name}`} data-id={repo.id}>
      {selectionControl}
    </div>
  ),
  RepoCardData: {},
}));

const userItem: Extract<FavoriteItem, { kind: "user" }> = {
  kind: "user",
  id: "user:42",
  username: "octo",
  avatarUrl: "https://example.com/avatar.png",
  htmlUrl: "https://example.com/user",
};

const orgItem: Extract<FavoriteItem, { kind: "org" }> = {
  kind: "org",
  id: "org:7",
  username: "octo-org",
  avatarUrl: "https://example.com/org.png",
  htmlUrl: "https://example.com/org",
};

const repoItem: Extract<FavoriteItem, { kind: "repo" }> = {
  kind: "repo",
  id: "repo:99",
  fullName: "octo/repo",
  description: "Test repo",
  htmlUrl: "https://example.com/repo",
  stars: 100,
};

describe("FavoritesList", () => {
  it("shows empty state when there are no favorites", () => {
    render(<FavoritesList users={[]} orgs={[]} repos={[]} />);

    expect(screen.getByText("No favorites yet.")).toBeInTheDocument();
  });

  it("renders all sections and maps ids to numeric values", () => {
    render(<FavoritesList users={[userItem]} orgs={[orgItem]} repos={[repoItem]} />);

    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("Organizations")).toBeInTheDocument();
    expect(screen.getByText("Repositories")).toBeInTheDocument();
    expect(screen.getByTestId("user-card-octo")).toBeInTheDocument();
    expect(screen.getByTestId("user-card-octo-org")).toBeInTheDocument();
    expect(screen.getByTestId("repo-card-octo/repo")).toBeInTheDocument();
  });

  it("shows the global empty state when all lists are empty", () => {
    render(<FavoritesList activeType={SEARCH_TYPES.USERS} users={[]} orgs={[]} repos={[]} />);

    expect(screen.getByText("No favorites yet.")).toBeInTheDocument();
    expect(screen.queryByText("Users")).not.toBeInTheDocument();
  });

  it("shows section-specific empty states when some lists have data", () => {
    render(
      <FavoritesList activeType={SEARCH_TYPES.USERS} users={[]} orgs={[orgItem]} repos={[]} />,
    );

    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("No user favorites.")).toBeInTheDocument();
    expect(screen.queryByText("Organizations")).not.toBeInTheDocument();
  });

  it("renders only the organizations section when activeType is organizations", () => {
    render(
      <FavoritesList
        activeType={SEARCH_TYPES.ORGANIZATIONS}
        users={[userItem]}
        orgs={[orgItem]}
        repos={[repoItem]}
      />,
    );

    expect(screen.getByText("Organizations")).toBeInTheDocument();
    expect(screen.queryByText("Users")).not.toBeInTheDocument();
    expect(screen.queryByText("Repositories")).not.toBeInTheDocument();
  });

  it("renders only the repositories section when activeType is repositories", () => {
    render(
      <FavoritesList
        activeType={SEARCH_TYPES.REPOSITORIES}
        users={[userItem]}
        orgs={[orgItem]}
        repos={[repoItem]}
      />,
    );

    expect(screen.getByText("Repositories")).toBeInTheDocument();
    expect(screen.queryByText("Users")).not.toBeInTheDocument();
    expect(screen.queryByText("Organizations")).not.toBeInTheDocument();
  });

  it("shows section-specific empty messages when activeType is all", () => {
    render(<FavoritesList activeType="all" users={[]} orgs={[orgItem]} repos={[]} />);

    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("No user favorites.")).toBeInTheDocument();
    expect(screen.getByText("Organizations")).toBeInTheDocument();
    expect(screen.getByText("Repositories")).toBeInTheDocument();
    expect(screen.getByText("No repository favorites.")).toBeInTheDocument();
  });

  it("does not render selection controls when selection is disabled", () => {
    render(<FavoritesList users={[userItem]} orgs={[orgItem]} repos={[repoItem]} />);

    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("renders unchecked checkboxes when selection is enabled but nothing is selected", () => {
    render(
      <FavoritesList users={[userItem]} orgs={[]} repos={[]} selectionEnabled selectedIds={[]} />,
    );

    const checkbox = screen.getByRole("checkbox", { name: "Select octo" });
    expect(checkbox).not.toBeChecked();
  });

  it("ignores selected ids that are not in the list", () => {
    render(
      <FavoritesList
        users={[userItem]}
        orgs={[]}
        repos={[]}
        selectionEnabled
        selectedIds={["missing-id"]}
      />,
    );

    const checkbox = screen.getByRole("checkbox", { name: "Select octo" });
    expect(checkbox).not.toBeChecked();
  });

  it("renders loading skeletons and hides empty state", () => {
    const { container } = render(<FavoritesList isLoading activeType={SEARCH_TYPES.USERS} />);

    expect(container.querySelectorAll(".MuiSkeleton-root").length).toBeGreaterThan(0);
    expect(screen.queryByText("No favorites yet.")).not.toBeInTheDocument();
  });

  it("uses accessible labels for selection controls", () => {
    render(<FavoritesList users={[userItem]} orgs={[]} repos={[]} selectionEnabled />);

    expect(screen.getByRole("checkbox", { name: "Select octo" })).toBeInTheDocument();
  });

  it("uses accessible labels for organization selection controls", () => {
    render(
      <FavoritesList
        users={[]}
        orgs={[orgItem]}
        repos={[]}
        selectionEnabled
        activeType={SEARCH_TYPES.ORGANIZATIONS}
      />,
    );

    expect(screen.getByRole("checkbox", { name: "Select octo-org" })).toBeInTheDocument();
  });

  it("uses accessible labels for repository selection controls", () => {
    render(
      <FavoritesList
        users={[]}
        orgs={[]}
        repos={[repoItem]}
        selectionEnabled
        activeType={SEARCH_TYPES.REPOSITORIES}
      />,
    );

    expect(screen.getByRole("checkbox", { name: "Select octo/repo" })).toBeInTheDocument();
  });

  it("supports selection toggles", async () => {
    const onToggleSelect = vi.fn();
    render(
      <FavoritesList
        users={[userItem]}
        orgs={[]}
        repos={[]}
        selectionEnabled
        selectedIds={["user:42"]}
        onToggleSelect={onToggleSelect}
      />,
    );

    const checkbox = screen.getByRole("checkbox", { name: "Select octo" });
    expect(checkbox).toBeChecked();

    await userEvent.click(checkbox);
    expect(onToggleSelect).toHaveBeenCalledWith("user:42");
  });

  it("renders skeletons while loading", () => {
    const { container } = render(<FavoritesList isLoading activeType="all" />);

    expect(container.querySelectorAll(".MuiSkeleton-root").length).toBeGreaterThan(0);
    expect(screen.queryByText("No favorites yet.")).not.toBeInTheDocument();
  });
});
