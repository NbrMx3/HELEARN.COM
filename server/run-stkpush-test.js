import axios from 'axios'

async function run() {
  try {
    const resp = await axios.post('http://localhost:3001/api/mpesa/stkpush', {
      registeredPhone: '0712345678',
      payerPhone: '0712345678',
      amount: 100,
      accountReference: 'HELEARN',
      transactionDesc: 'Verification fee'
    }, { headers: { 'Content-Type': 'application/json' } })

    console.log('RESPONSE', JSON.stringify(resp.data, null, 2))
  } catch (e) {
    if (e.response) {
      console.error('ERR_STATUS', e.response.status)
      console.error('ERR_BODY', JSON.stringify(e.response.data || e.response.statusText, null, 2))
    } else {
      console.error('ERR', e.message)
    }
    process.exit(1)
  }
}

run()
