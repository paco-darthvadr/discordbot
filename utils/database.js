const fs = require('node:fs');
const path = require('node:path');


const DATA_FILE = path.normalize(path.join(__dirname, 'processedChallenges.json'));
const DISCORD_USERS = path.normalize(path.join(__dirname, 'discordUsers.json'));

function getProcessedChallenges(id) {
  let processedChallenges = new Map();
  if (fs.existsSync(DATA_FILE)) {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    processedChallenges = new Map(JSON.parse(data));
  }
  return processedChallenges.get(id);
}

function setProcessedChallenges(id, challenge) {
  let processedChallenges = new Map();
  if (fs.existsSync(DATA_FILE)) {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    processedChallenges = new Map(JSON.parse(data));
  }
  processedChallenges.set(id, challenge);
  const data = JSON.stringify(Array.from(processedChallenges.entries()), null, 2);
  fs.writeFileSync(DATA_FILE, data);
}

function getDiscordUsers() {
  let discordUsers = {};
  if (fs.existsSync(DISCORD_USERS)) {
    const data = fs.readFileSync(DISCORD_USERS, 'utf8');
    discordUsers = JSON.parse(data);
  }
  return discordUsers;
}

function setDiscordUsers(user, data) {
  let discordUsers = {};
  if(fs.existsSync(DISCORD_USERS)){
    const userData = fs.readFileSync(DISCORD_USERS, 'utf-8');
    discordUsers = JSON.parse(userData)
  }
  discordUsers[user] = {
    ...discordUsers[user], ...data,
    timestamp: new Date().toISOString()
  }
  const userData = JSON.stringify(discordUsers, null, 2);
  fs.writeFileSync(DISCORD_USERS, userData);
}

function checkDiscordUserExists(user) {
  let discordUsers = {};
  if (fs.existsSync(DISCORD_USERS)) {
    const data = fs.readFileSync(DISCORD_USERS, 'utf8');
    discordUsers = JSON.parse(data);
  }
  return discordUsers[user] && discordUsers[user].verified && discordUsers[user].signingid;
}

function checksigningid(user){
  let discordUsers = getDiscordUsers();
  if (fs.existsSync(DISCORD_USERS)) {
    const data = fs.readFileSync(DISCORD_USERS, 'utf8');
    discordUsers = JSON.parse(data);
  }
  return discordUsers[user] && discordUsers[user].signingId;
}

function updateDiscordUser(user, updateData){
  let discordUsers = getDiscordUsers();
  if(discordUsers[user]){
    discordUsers[user] = { ...discordUsers[user], ...updateData };
    const data = fs.readFileSync(DISCORD_USERS, 'utf-8');
    const discordUsers = JSON.parse(data)
  }
}

function deleteDiscordUser(user) {
  let discordUsers = {};
  if (fs.existsSync(DISCORD_USERS)) {
    const data = fs.readFileSync(DISCORD_USERS, 'utf8');
    discordUsers = JSON.parse(data);
  }
  delete discordUsers[user];
  const data = JSON.stringify(discordUsers, null, 2);
  fs.writeFileSync(DISCORD_USERS, data);
}

exports.getProcessedChallenges = getProcessedChallenges;
exports.setProcessedChallenges = setProcessedChallenges;
exports.getDiscordUsers = getDiscordUsers;
exports.setDiscordUsers = setDiscordUsers;
exports.checkDiscordUserExists = checkDiscordUserExists;
exports.deleteDiscordUser = deleteDiscordUser;
exports.updateDiscordUser = updateDiscordUser
exports.checksigningid = checksigningid;