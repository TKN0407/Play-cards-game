import { execSync } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const outDir = path.join(projectRoot, 'public', 'sounds');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log('Using ffmpeg binary:', ffmpegPath);

// 1. Generate match "ding" sound
console.log('Generating match.mp3...');
const matchFile = path.join(outDir, 'match.mp3');
execSync(`"${ffmpegPath}" -y -f lavfi -i "aevalsrc=exprs='(0.7*sin(2*PI*1318.5*t)+0.3*sin(2*PI*2637*t))*exp(-10*t)':s=44100:d=0.38" -b:a 192k "${matchFile}"`, { stdio: 'inherit' });

// 2. Generate 3 ascending notes for victory fanfare
console.log('Generating victory.mp3 (3 ascending notes fanfare)...');
const n1 = path.join(outDir, 'temp1.wav');
const n2 = path.join(outDir, 'temp2.wav');
const n3 = path.join(outDir, 'temp3.wav');
const victoryFile = path.join(outDir, 'victory.mp3');

// C5 (523.25Hz) -> E5 (659.25Hz) -> C6 (1046.5Hz)
execSync(`"${ffmpegPath}" -y -f lavfi -i "aevalsrc=exprs='(0.75*sin(2*PI*523.25*t)+0.25*sin(2*PI*1046.5*t))*exp(-5*t)':s=44100:d=0.22" "${n1}"`, { stdio: 'inherit' });
execSync(`"${ffmpegPath}" -y -f lavfi -i "aevalsrc=exprs='(0.75*sin(2*PI*659.25*t)+0.25*sin(2*PI*1318.5*t))*exp(-5*t)':s=44100:d=0.22" "${n2}"`, { stdio: 'inherit' });
execSync(`"${ffmpegPath}" -y -f lavfi -i "aevalsrc=exprs='(0.75*sin(2*PI*1046.5*t)+0.25*sin(2*PI*2093*t))*exp(-3.5*t)':s=44100:d=0.75" "${n3}"`, { stdio: 'inherit' });

execSync(`"${ffmpegPath}" -y -i "${n1}" -i "${n2}" -i "${n3}" -filter_complex "[0:a][1:a][2:a]concat=n=3:v=0:a=1[out]" -map "[out]" -b:a 192k "${victoryFile}"`, { stdio: 'inherit' });

// Clean temp files
[n1, n2, n3].forEach((f) => {
  if (fs.existsSync(f)) fs.unlinkSync(f);
});

console.log('Done! Created:');
console.log(' -', matchFile);
console.log(' -', victoryFile);
