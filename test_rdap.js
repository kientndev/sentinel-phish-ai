const domain = process.argv[2] || 'google.com';
fetch(`https://rdap.org/domain/${domain}`)
  .then(res => res.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(console.error);
