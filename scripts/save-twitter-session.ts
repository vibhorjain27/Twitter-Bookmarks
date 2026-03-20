#!/usr/bin/env node
/**
 * Run this script once to save your Twitter/X session cookies.
 * A browser window will open — log in to Twitter, then press Enter in the terminal.
 *
 * Usage: npm run save-twitter-session
 */

import { saveTwitterSession } from '../lib/playwright-fetcher'

saveTwitterSession()
  .then(() => {
    console.log('✓ Twitter session saved successfully!')
    console.log('You can now use the "Refresh Bookmarks" button in the app.')
    process.exit(0)
  })
  .catch((err) => {
    console.error('✗ Failed to save session:', err)
    process.exit(1)
  })
