import { execSync } from 'node:child_process';

export interface GitCommit {
    hash: string;
    shortHash: string;
    author: string;
    date: string; // ISO string
    subject: string;
    type: 'feat' | 'fix' | 'style' | 'refactor' | 'docs' | 'chore' | 'other';
    scope?: string | undefined;
    message: string;
}

export interface CommitGroup {
    key: string; // "October 2026"
    year: number;
    month: number;
    commits: GitCommit[];
}

function parseCommitType(subject: string): { type: GitCommit['type']; scope?: string; message: string } {
    const match = subject.match(/^([a-zA-Z0-9_-]+)(?:\(([^)]+)\))?!?:\s*(.+)$/);
    if (match) {
        const rawType = match[1].toLowerCase();
        const scope = match[2]?.trim();
        const message = match[3]?.trim();

        let type: GitCommit['type'] = 'other';
        if (rawType === 'feat') type = 'feat';
        else if (rawType === 'fix') type = 'fix';
        else if (rawType === 'style') type = 'style';
        else if (rawType === 'refactor') type = 'refactor';
        else if (rawType === 'docs') type = 'docs';
        else if (rawType === 'chore') type = 'chore';

        return { type, scope, message };
    }

    return { type: 'other', message: subject };
}

let cachedCommitGroups: CommitGroup[] | null = null;

export function getGitChangelog(): CommitGroup[] {
    if (cachedCommitGroups) {
        return cachedCommitGroups;
    }

    try {
        const logOutput = execSync('git log --format="%H||%h||%an||%ad||%s" --date=iso-strict', {
            encoding: 'utf-8',
            maxBuffer: 10 * 1024 * 1024
        }).trim();

        if (!logOutput) {
            return [];
        }

        const lines = logOutput.split('\n');
        const commits: GitCommit[] = [];
        for (const line of lines) {
            const parts = line.split('||');
            if (parts.length < 5) continue;
            const [hash, shortHash, author, date, subject] = parts;
            const { type, scope, message } = parseCommitType(subject);

            commits.push({
                hash,
                shortHash,
                author,
                date,
                subject,
                type,
                scope,
                message
            });
        }

        // Group commits by Year and Month (e.g. October 2026)
        const groupsMap = new Map<string, { year: number; month: number; commits: GitCommit[] }>();

        for (const commit of commits) {
            const d = new Date(commit.date);
            const year = d.getUTCFullYear();
            const month = d.getUTCMonth(); // 0-indexed
            const monthName = d.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
            const key = `${monthName} ${year}`;

            if (!groupsMap.has(key)) {
                groupsMap.set(key, { year, month, commits: [] });
            }
            groupsMap.get(key)!.commits.push(commit);
        }

        const groups: CommitGroup[] = Array.from(groupsMap.entries()).map(([key, data]) => ({
            key,
            year: data.year,
            month: data.month,
            commits: data.commits
        }));

        cachedCommitGroups = groups;
        return groups;
    } catch {
        return [];
    }
}
