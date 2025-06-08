import { GET } from '../route'
import { NextRequest } from 'next/server'
import * as db from '@/lib/db'

// Mock the database functions
jest.mock('@/lib/db', () => ({
  executeStoredProcedure: jest.fn(),
}))

const mockExecuteStoredProcedure = db.executeStoredProcedure as jest.MockedFunction<typeof db.executeStoredProcedure>

describe('/api/seferler/ara', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns error when required parameters are missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/seferler/ara')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Kalkış ili, varış ili ve tarih parametreleri gereklidir.')
  })

  it('returns error for invalid date format', async () => {
    const request = new NextRequest('http://localhost:3000/api/seferler/ara?kalkis_il=İstanbul&varis_il=Ankara&tarih=invalid-date')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Geçersiz tarih formatı. YYYY-MM-DD formatında olmalıdır.')
  })

  it('returns error for past date', async () => {
    const request = new NextRequest('http://localhost:3000/api/seferler/ara?kalkis_il=İstanbul&varis_il=Ankara&tarih=2020-01-01')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Geçmiş tarih seçilemez.')
  })

  it('returns successful response with data', async () => {
    const mockSeferData = [
      {
        sefer_id: 1,
        otobus_id: 1,
        plaka: '34 ABC 123',
        firma_adi: 'Metro Turizm',
        kalkis_istasyon_id: 1,
        kalkis_istasyon_adi: 'Büyük Otogar',
        kalkis_il: 'İstanbul',
        varis_istasyon_id: 2,
        varis_istasyon_adi: 'AŞTİ',
        varis_il: 'Ankara',
        kalkis_zamani: '2024-12-31 08:00:00',
        varis_zamani: '2024-12-31 13:00:00',
        ucret: 150.00
      }
    ]

    mockExecuteStoredProcedure.mockResolvedValue(mockSeferData)

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowString = tomorrow.toISOString().split('T')[0]

    const request = new NextRequest(`http://localhost:3000/api/seferler/ara?kalkis_il=İstanbul&varis_il=Ankara&tarih=${tomorrowString}`)
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toEqual(mockSeferData)
    expect(mockExecuteStoredProcedure).toHaveBeenCalledWith('sp_sefer_ara', [
      'İstanbul',
      'Ankara',
      tomorrowString
    ])
  })

  it('returns mock data when stored procedure does not exist', async () => {
    const dbError = new Error('Stored procedure not found')
    ;(dbError as any).code = 'ER_SP_DOES_NOT_EXIST'
    
    mockExecuteStoredProcedure.mockRejectedValue(dbError)

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowString = tomorrow.toISOString().split('T')[0]

    const request = new NextRequest(`http://localhost:3000/api/seferler/ara?kalkis_il=İstanbul&varis_il=Ankara&tarih=${tomorrowString}`)
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.mock).toBe(true)
    expect(data.data).toHaveLength(3)
  })

  it('returns error for database errors', async () => {
    const dbError = new Error('Database connection failed')
    mockExecuteStoredProcedure.mockRejectedValue(dbError)

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowString = tomorrow.toISOString().split('T')[0]

    const request = new NextRequest(`http://localhost:3000/api/seferler/ara?kalkis_il=İstanbul&varis_il=Ankara&tarih=${tomorrowString}`)
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Seferler yüklenirken bir hata oluştu.')
  })
}) 