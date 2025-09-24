import * as assert from 'assert';
import { computeDiffs, detectDeletedDiffs, formatDiff } from '../router/showchanges';

suite('showChanges helpers', () => {
    test('formatDiff shows added, removed and unchanged lines', () => {
        const oldText = 'line1\nline2\nline3\n';
        const newText = 'line1\nline2-modified\nline4\n';
        const out = formatDiff('some/file.txt', oldText, newText);
    // basic sanity checks
    assert.ok(out.includes('--- some/file.txt ---'));
    assert.ok(out.includes('- line2'));
    assert.ok(out.includes('+ line2-modified'));
    assert.ok(out.includes('+ line4'));
    });

    test('computeDiffs detects new and modified files', () => {
        const previous = {
            'a.txt': 'one\ntwo\n'
        };
        const current = {
            'a.txt': 'one\ntwo-modified\n',
            'b.txt': 'newfile\n'
        };

        const diffs = computeDiffs(previous, current);
        // should contain one diff for modified a.txt and one for new b.txt
        assert.strictEqual(diffs.length, 2);
        const joined = diffs.join('\n');
        assert.ok(joined.includes('--- a.txt ---') || joined.includes('+++ b.txt'));
        assert.ok(joined.includes('+++ b.txt (new file) +++'));
    });

    test('detectDeletedDiffs finds deleted files', () => {
        const previous = {
            'x.txt': 'old\n',
            'y.txt': 'keep\n'
        };
        const current = {
            'y.txt': 'keep\n'
        };

        const del = detectDeletedDiffs(previous, current);
        assert.strictEqual(del.length, 1);
        assert.ok(del[0].includes('--- x.txt (deleted) ---'));
    });
});
