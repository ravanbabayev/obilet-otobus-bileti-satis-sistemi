import { render, screen, fireEvent } from '@testing-library/react'
import Header from '../Header'

describe('Header Component', () => {
  it('renders logo and navigation links', () => {
    render(<Header />)
    
    // Logo kontrolü
    expect(screen.getByText('OBilet')).toBeInTheDocument()
    
    // Navigation links kontrolü
    expect(screen.getByText('Ana Sayfa')).toBeInTheDocument()
    expect(screen.getByText('Seferler')).toBeInTheDocument()
    expect(screen.getByText('Hakkımızda')).toBeInTheDocument()
    expect(screen.getByText('İletişim')).toBeInTheDocument()
  })

  it('shows login and register buttons when user is not logged in', () => {
    render(<Header />)
    
    expect(screen.getByText('Giriş Yap')).toBeInTheDocument()
    expect(screen.getByText('Kayıt Ol')).toBeInTheDocument()
  })

  it('toggles mobile menu when hamburger button is clicked', () => {
    render(<Header />)
    
    // Mobile menu should not be visible initially
    const mobileMenu = screen.queryByTestId('mobile-menu')
    expect(mobileMenu).not.toBeInTheDocument()
    
    // Click hamburger button
    const hamburgerButton = screen.getByRole('button')
    fireEvent.click(hamburgerButton)
    
    // Mobile menu should be visible after click
    const mobileNavigation = screen.getByRole('navigation')
    expect(mobileNavigation).toBeInTheDocument()
  })

  it('has correct link hrefs', () => {
    render(<Header />)
    
    const homeLink = screen.getAllByText('Ana Sayfa')[0].closest('a')
    expect(homeLink).toHaveAttribute('href', '/')
    
    const seferlerLink = screen.getAllByText('Seferler')[0].closest('a')
    expect(seferlerLink).toHaveAttribute('href', '/seferler')
    
    const loginLink = screen.getByText('Giriş Yap').closest('a')
    expect(loginLink).toHaveAttribute('href', '/giris')
    
    const registerLink = screen.getByText('Kayıt Ol').closest('a')
    expect(registerLink).toHaveAttribute('href', '/kayit')
  })

  it('applies hover styles on navigation links', () => {
    render(<Header />)
    
    const homeLink = screen.getAllByText('Ana Sayfa')[0]
    expect(homeLink).toHaveClass('hover:text-red-600')
  })
}) 