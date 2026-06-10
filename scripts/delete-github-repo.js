const OWNER = "jackwbinny-design";
const repoFullName = process.argv[2];
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const confirmation = process.env.CONFIRM_DELETE;

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!repoFullName) {
  fail("Usage: CONFIRM_DELETE=jackwbinny-design/repo-name GITHUB_TOKEN=... npm run delete:repo -- jackwbinny-design/repo-name");
}

if (!repoFullName.startsWith(`${OWNER}/`)) {
  fail(`Refusing to delete outside ${OWNER}: ${repoFullName}`);
}

if (confirmation !== repoFullName) {
  fail(`Refusing to delete without exact confirmation. Set CONFIRM_DELETE=${repoFullName}`);
}

if (!token) {
  fail("Missing GITHUB_TOKEN or GH_TOKEN with permission to delete repositories.");
}

const response = await fetch(`https://api.github.com/repos/${repoFullName}`, {
  method: "DELETE",
  headers: {
    "Accept": "application/vnd.github+json",
    "Authorization": `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28"
  }
});

if (response.status === 204) {
  console.log(`Deleted ${repoFullName}`);
} else {
  const text = await response.text();
  fail(`GitHub delete failed: ${response.status} ${response.statusText}\n${text}`);
}
