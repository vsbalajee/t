import streamlit as st
import pandas as pd
from supabase import create_client, Client
import json

# Page configuration
st.set_page_config(
    page_title="Supabase Table Viewer",
    page_icon="🗃️",
    layout="wide"
)

def init_supabase():
    """Initialize Supabase client"""
    try:
        url = st.secrets["supabase"]["url"]
        key = st.secrets["supabase"]["anon_key"]
        supabase: Client = create_client(url, key)
        return supabase
    except Exception as e:
        st.error(f"Failed to connect to Supabase: {str(e)}")
        return None

def get_table_names(supabase):
    """Fetch all table names from the database"""
    try:
        # Query to get all user tables (excluding system tables)
        query = """
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
        """
        
        result = supabase.rpc('exec_sql', {'sql': query}).execute()
        
        if result.data:
            # Extract table names from the result
            tables = [row['table_name'] for row in result.data]
            return tables
        else:
            return []
    except Exception as e:
        st.error(f"Error fetching tables: {str(e)}")
        return []

def get_table_schema(supabase, table_name):
    """Get schema information for a specific table"""
    try:
        query = f"""
        SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default,
            ordinal_position
        FROM information_schema.columns 
        WHERE table_name = '{table_name}' 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
        """
        
        result = supabase.rpc('exec_sql', {'sql': query}).execute()
        return result.data if result.data else []
    except Exception as e:
        st.error(f"Error fetching table schema: {str(e)}")
        return []

def get_table_data(supabase, table_name, limit=100):
    """Fetch data from a specific table"""
    try:
        result = supabase.table(table_name).select("*").limit(limit).execute()
        return result.data if result.data else []
    except Exception as e:
        st.error(f"Error fetching table data: {str(e)}")
        return []

def main():
    st.title("🗃️ Supabase Table Viewer")
    st.markdown("---")
    
    # Initialize Supabase
    supabase = init_supabase()
    
    if not supabase:
        st.error("❌ Cannot connect to Supabase. Please check your credentials in secrets.toml")
        st.info("Make sure you have created .streamlit/secrets.toml with your Supabase credentials")
        return
    
    st.success("✅ Connected to Supabase successfully!")
    
    # Sidebar for navigation
    st.sidebar.title("Navigation")
    
    # Fetch tables
    with st.spinner("Fetching tables..."):
        tables = get_table_names(supabase)
    
    if not tables:
        st.warning("No tables found in your database")
        return
    
    st.sidebar.subheader("Available Tables")
    selected_table = st.sidebar.selectbox("Select a table:", [""] + tables)
    
    # Main content area
    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.subheader("📋 Tables Overview")
        st.write(f"Total tables: **{len(tables)}**")
        
        # Display all tables
        for i, table in enumerate(tables, 1):
            if table == selected_table:
                st.markdown(f"**{i}. {table}** ⭐")
            else:
                st.write(f"{i}. {table}")
    
    with col2:
        if selected_table:
            st.subheader(f"📊 Table: {selected_table}")
            
            # Create tabs for schema and data
            tab1, tab2 = st.tabs(["Schema", "Data"])
            
            with tab1:
                st.write("**Table Schema:**")
                with st.spinner("Loading schema..."):
                    schema = get_table_schema(supabase, selected_table)
                
                if schema:
                    schema_df = pd.DataFrame(schema)
                    st.dataframe(schema_df, use_container_width=True)
                else:
                    st.warning("No schema information available")
            
            with tab2:
                st.write("**Table Data (First 100 rows):**")
                
                # Add refresh button
                if st.button("🔄 Refresh Data"):
                    st.rerun()
                
                with st.spinner("Loading data..."):
                    data = get_table_data(supabase, selected_table)
                
                if data:
                    data_df = pd.DataFrame(data)
                    st.write(f"Showing {len(data)} rows")
                    st.dataframe(data_df, use_container_width=True)
                    
                    # Download option
                    csv = data_df.to_csv(index=False)
                    st.download_button(
                        label="📥 Download as CSV",
                        data=csv,
                        file_name=f"{selected_table}_data.csv",
                        mime="text/csv"
                    )
                else:
                    st.info("No data found in this table")
        else:
            st.info("👈 Select a table from the sidebar to view its details")

if __name__ == "__main__":
    main()