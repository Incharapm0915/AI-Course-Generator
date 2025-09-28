import ReactJson from 'react-json-view';

// Replace textarea for `content` with ReactJson editor:
  
<ReactJson
  src={content ? JSON.parse(content) : {}}
  onEdit={({ updated_src }) => setContent(JSON.stringify(updated_src, null, 2))}
  onAdd={({ updated_src }) => setContent(JSON.stringify(updated_src, null, 2))}
  onDelete={({ updated_src }) => setContent(JSON.stringify(updated_src, null, 2))}
  collapsed={false}
  enableClipboard={true}
  displayDataTypes={false}
  style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}
/>
