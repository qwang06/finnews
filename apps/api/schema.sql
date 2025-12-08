-- FinNews Database Schema
-- Tables for storing stock ticker information

-- Create exchanges table (normalized)
CREATE TABLE IF NOT EXISTS exchanges (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sectors table (normalized)
CREATE TABLE IF NOT EXISTS sectors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create industries table (normalized)
CREATE TABLE IF NOT EXISTS industries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) UNIQUE NOT NULL,
    sector_id INTEGER REFERENCES sectors(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create main tickers table
CREATE TABLE IF NOT EXISTS tickers (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    exchange_id INTEGER REFERENCES exchanges(id),
    industry_id INTEGER REFERENCES industries(id),
    sector_id INTEGER REFERENCES sectors(id),
    country VARCHAR(100),
    ipo_year VARCHAR(4),
    nasdaq_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ticker prices table (for historical tracking)
CREATE TABLE IF NOT EXISTS ticker_prices (
    id SERIAL PRIMARY KEY,
    ticker_id INTEGER REFERENCES tickers(id) ON DELETE CASCADE,
    last_sale DECIMAL(15, 4),
    net_change DECIMAL(15, 4),
    pct_change DECIMAL(10, 4),
    volume BIGINT,
    market_cap DECIMAL(20, 2),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tickers_symbol ON tickers(symbol);
CREATE INDEX IF NOT EXISTS idx_tickers_exchange ON tickers(exchange_id);
CREATE INDEX IF NOT EXISTS idx_tickers_sector ON tickers(sector_id);
CREATE INDEX IF NOT EXISTS idx_tickers_industry ON tickers(industry_id);
CREATE INDEX IF NOT EXISTS idx_ticker_prices_ticker_id ON ticker_prices(ticker_id);
CREATE INDEX IF NOT EXISTS idx_ticker_prices_recorded_at ON ticker_prices(recorded_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for tickers table
DROP TRIGGER IF EXISTS update_tickers_updated_at ON tickers;
CREATE TRIGGER update_tickers_updated_at
    BEFORE UPDATE ON tickers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default exchanges
INSERT INTO exchanges (code, name) VALUES
    ('NASDAQ', 'NASDAQ Stock Market'),
    ('NYSE', 'New York Stock Exchange'),
    ('AMEX', 'American Stock Exchange')
ON CONFLICT (code) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE tickers IS 'Main table storing stock ticker information';
COMMENT ON TABLE ticker_prices IS 'Historical price data for tickers';
COMMENT ON TABLE exchanges IS 'Stock exchange information (NASDAQ, NYSE, AMEX)';
COMMENT ON TABLE sectors IS 'Business sectors (e.g., Technology, Healthcare)';
COMMENT ON TABLE industries IS 'Industry classifications within sectors';
