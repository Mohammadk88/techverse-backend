const fs = require('fs');
const path = require('path');

// Read the existing swagger spec
const existingSwagger = JSON.parse(fs.readFileSync('swagger-spec.json', 'utf8'));

// Read the new endpoints
const newEndpoints = JSON.parse(fs.readFileSync('new-endpoints.json', 'utf8'));

// Merge the paths
const mergedSwagger = {
  ...existingSwagger,
  paths: {
    ...existingSwagger.paths,
    ...newEndpoints.paths
  }
};

// Update the tags to include new ones
const existingTags = mergedSwagger.info.tags || [];
const newTags = [
  { name: 'events', description: 'Event management system replacing forums' },
  { name: 'issues', description: 'Issue tracking system with developer ranking' },
  { name: 'reports', description: 'Content moderation and reporting system' }
];

// Add new tags if they don't exist
newTags.forEach(newTag => {
  if (!existingTags.find(tag => tag.name === newTag.name)) {
    existingTags.push(newTag);
  }
});

mergedSwagger.info.tags = existingTags;

// Write the merged swagger to swagger-export.json
fs.writeFileSync('swagger-export.json', JSON.stringify(mergedSwagger, null, 2));

console.log('✅ Successfully merged swagger documentation!');
console.log(`📊 Total endpoints: ${Object.keys(mergedSwagger.paths).length}`);
console.log('📁 Output: swagger-export.json');

// Show the new endpoints
const newEndpointPaths = Object.keys(newEndpoints.paths);
console.log('\n🆕 New endpoints added:');
newEndpointPaths.forEach(path => {
  const methods = Object.keys(newEndpoints.paths[path]);
  methods.forEach(method => {
    const endpoint = newEndpoints.paths[path][method];
    console.log(`  ${method.toUpperCase()} ${path} - ${endpoint.summary}`);
  });
});
