import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import BiletAramaForm from '../BiletAramaForm'

// Mock useRouter
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('BiletAramaForm Component', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it('renders all form fields', () => {
    render(<BiletAramaForm />)
    
    // Form alanları kontrolü
    expect(screen.getByLabelText(/Nereden/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Nereye/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Tarih/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Sefer Ara/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    render(<BiletAramaForm />)
    
    const submitButton = screen.getByRole('button', { name: /Sefer Ara/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Kalkış şehri seçiniz')).toBeInTheDocument()
      expect(screen.getByText('Varış şehri seçiniz')).toBeInTheDocument()
      expect(screen.getByText('Tarih seçiniz')).toBeInTheDocument()
    })
  })

  it('shows error when same cities are selected', async () => {
    render(<BiletAramaForm />)
    
    const kalkisSelect = screen.getByLabelText(/Nereden/i)
    const varisSelect = screen.getByLabelText(/Nereye/i)
    const tarihInput = screen.getByLabelText(/Tarih/i)
    const submitButton = screen.getByRole('button', { name: /Sefer Ara/i })
    
    // Aynı şehirleri seç
    fireEvent.change(kalkisSelect, { target: { value: 'İstanbul' } })
    fireEvent.change(varisSelect, { target: { value: 'İstanbul' } })
    fireEvent.change(tarihInput, { target: { value: '2024-12-31' } })
    
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Kalkış ve varış şehri aynı olamaz')).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    render(<BiletAramaForm />)
    
    const kalkisSelect = screen.getByLabelText(/Nereden/i)
    const varisSelect = screen.getByLabelText(/Nereye/i)
    const tarihInput = screen.getByLabelText(/Tarih/i)
    const submitButton = screen.getByRole('button', { name: /Sefer Ara/i })
    
    // Geçerli veriler gir
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowString = tomorrow.toISOString().split('T')[0]
    
    fireEvent.change(kalkisSelect, { target: { value: 'İstanbul' } })
    fireEvent.change(varisSelect, { target: { value: 'Ankara' } })
    fireEvent.change(tarihInput, { target: { value: tomorrowString } })
    
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('/seferler?kalkis_il=İstanbul&varis_il=Ankara&tarih=' + tomorrowString)
      )
    })
  })

  it('swaps cities when swap button is clicked', () => {
    render(<BiletAramaForm />)
    
    const kalkisSelect = screen.getByLabelText(/Nereden/i) as HTMLSelectElement
    const varisSelect = screen.getByLabelText(/Nereye/i) as HTMLSelectElement
    const swapButton = screen.getByTitle('Şehirleri değiştir')
    
    // İlk değerleri ayarla
    fireEvent.change(kalkisSelect, { target: { value: 'İstanbul' } })
    fireEvent.change(varisSelect, { target: { value: 'Ankara' } })
    
    // Değiştir butonuna tıkla
    fireEvent.click(swapButton)
    
    // Değerlerin yer değiştirdiğini kontrol et
    expect(kalkisSelect.value).toBe('Ankara')
    expect(varisSelect.value).toBe('İstanbul')
  })
}) 