# Supabase Table Viewer with Streamlit

A simple Python application using Streamlit to view tables and data from your Supabase database.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Supabase Credentials**
   - Edit `.streamlit/secrets.toml` file
   - Add your Supabase project URL and API keys
   - Get these from your Supabase project dashboard: Settings > API

3. **Run the Application**
   ```bash
   streamlit run app.py
   ```

## Features

- ✅ Connect to Supabase database
- ✅ View all available tables
- ✅ Display table schemas with column information
- ✅ Browse table data (first 100 rows)
- ✅ Download table data as CSV
- ✅ Responsive sidebar navigation

## Next Steps

Once this basic viewer works, we can extend it to include:
- Create new tables
- Edit table schemas
- Add/Edit/Delete data (CRUD operations)
- Execute custom SQL queries

## Troubleshooting

- Make sure your Supabase credentials are correct in `secrets.toml`
- Ensure your Supabase project allows API access
- Check that you have the required Python packages installed