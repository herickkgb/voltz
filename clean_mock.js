const fs = require('fs');

function processFile(path) {
  let content = fs.readFileSync(path, 'utf8');

  // Strip imports of useMock
  content = content.replace(/, useMock /g, ' ');
  content = content.replace(/import \{ supabase, useMock \} from '\.\/supabase'/g, "import { supabase } from './supabase'");
  content = content.replace(/import \{ supabase, useMock \} from '@\/lib\/supabase'/g, "import { supabase } from '@/lib/supabase'");

  // Strip block useMock
  // This simplistic approach might fail on nested blocks, let's use regex for specific patterns.

  fs.writeFileSync(path, content);
}
