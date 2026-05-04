import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

function formatTimestamp(date=new Date()){
  const year = date.getFullYear()
  const month = String(date.getMonth()+1).padStart(2,'0')
  const day = String(date.getDate()).padStart(2,'0')
  const hours = String(date.getHours()).padStart(2,'0')
  const minutes = String(date.getMinutes()).padStart(2,'0')
  const seconds = String(date.getSeconds()).padStart(2,'0')
  return `${year}${month}${day}${hours}${minutes}${seconds}`
}

async function run(){
  try{
    const base = process.env.DARAJA_BASE_URL
    const key = process.env.DARAJA_CONSUMER_KEY
    const secret = process.env.DARAJA_CONSUMER_SECRET
    const shortcode = process.env.DARAJA_SHORTCODE
    const passkey = process.env.DARAJA_PASSKEY

    const tokenResp = await axios.get(`${base}/oauth/v1/generate?grant_type=client_credentials`, { headers: { Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString('base64')}` } })
    const token = tokenResp.data.access_token
    console.log('token:', token)

    const timestamp = formatTimestamp()
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64')

    const payload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: 100,
      PartyA: '254712345678',
      PartyB: shortcode,
      PhoneNumber: '254712345678',
      CallBackURL: process.env.DARAJA_CALLBACK_URL,
      AccountReference: 'HELEARN',
      TransactionDesc: 'Verification fee'
    }

    const resp = await axios.post(`${base}/mpesa/stkpush/v1/processrequest`, payload, { headers: { Authorization: `Bearer ${token}` } })
    console.log('STK OK', resp.data)
  }catch(e){
    if(e.response) console.error('STK ERR', e.response.status, e.response.data)
    else console.error('STK ERR', e.message)
    process.exit(1)
  }
}

run()
