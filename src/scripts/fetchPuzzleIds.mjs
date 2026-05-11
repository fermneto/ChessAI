import https from 'https';
import fs from 'fs';
import readline from 'readline';
import zlib from 'zlib';

const CSV_URL = 'https://database.lichess.org/lichess_db_puzzle.csv.zst';
const OUTPUT_FILE = './public/puzzle_ids.json';
const MAX_IDS = 10000;

console.log(`Downloading Lichess puzzles to extract ${MAX_IDS} IDs...`);