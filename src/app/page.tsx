export default function HomePage() {
  return (
    <div style={{
      background: 'yellow',
      color: 'black',
      fontSize: '30px',
      padding: '50px',
      minHeight: '100vh'
    }}>
      <h1>🟡 YELLOW PAGE - HOMEPAGE WORKING!</h1>
      <p>✅ If you see this yellow page, the homepage is working!</p>
      <p>🎯 BodyKey Weight Management</p>
      <button 
        style={{
          padding: '20px 40px', 
          backgroundColor: 'red', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '20px'
        }}
        onClick={() => alert('🎉 Button works! Website is functional!')}
      >
        TEST BUTTON - CLICK ME!
      </button>
    </div>
  )
}