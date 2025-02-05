from fastapi import FastAPI, HTTPException

from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
import io
import pandas as pd
import os

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Your React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Google Drive API setup
SCOPES = ['https://www.googleapis.com/auth/drive.file']
SERVICE_ACCOUNT_FILE = os.path.join(os.path.dirname(__file__), 'credentials.json')

try:
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES
    )
    drive_service = build('drive', 'v3', credentials=credentials)
except Exception as e:
    print(f"Error setting up Google Drive credentials: {e}")

class RegistrationData(BaseModel):
    name: str
    email: str
    stallNo: str

@app.post("/api/register")
async def register_user(data: RegistrationData):
    try:
        # Create DataFrame with the new registration
        new_registration = pd.DataFrame([{
            'Timestamp': datetime.now().isoformat(),
            'Name': data.name,
            'Email': data.email,
            'Stall_No': data.stallNo
        }])

        # Check if file exists in Google Drive
        file_name = 'registrations.csv'
        response = drive_service.files().list(
            q=f"name='{file_name}'",
            spaces='drive',
            fields='files(id, name)'
        ).execute()

        try:
            if response['files']:
                # File exists, update it
                file_id = response['files'][0]['id']
                print(f"Existing file ID: {file_id}")
                
                # Get existing content
                request = drive_service.files().get_media(fileId=file_id)
                existing_content = request.execute()
                existing_df = pd.read_csv(io.StringIO(existing_content.decode('utf-8')))
                
                # Append new registration
                updated_df = pd.concat([existing_df, new_registration], ignore_index=True)
                
                # Convert to CSV
                csv_buffer = io.StringIO()
                updated_df.to_csv(csv_buffer, index=False)
                media = MediaIoBaseUpload(
                    io.BytesIO(csv_buffer.getvalue().encode()),
                    mimetype='text/csv',
                    resumable=True
                )
                
                # Update file
                drive_service.files().update(
                    fileId=file_id,
                    media_body=media
                ).execute()

                # Ensure permission exists for the email
                try:
                    permission = drive_service.permissions().create(
                        fileId=file_id,
                        body={
                            'type': 'user',
                            'role': 'writer',
                            'emailAddress': 'ronitkothari22@gmail.com',
                            'sendNotificationEmail': True
                        }
                    ).execute()
                    print(f"Permission added/updated: {permission}")
                except Exception as perm_error:
                    print(f"Permission error: {str(perm_error)}")

                # Get and print the file's web link
                file_data = drive_service.files().get(
                    fileId=file_id,
                    fields='webViewLink'
                ).execute()
                print(f"File can be viewed at: {file_data.get('webViewLink')}")

            else:
                # Create new file
                csv_buffer = io.StringIO()
                new_registration.to_csv(csv_buffer, index=False)
                
                file_metadata = {
                    'name': file_name,
                    'mimeType': 'text/csv',
                }
                
                media = MediaIoBaseUpload(
                    io.BytesIO(csv_buffer.getvalue().encode()),
                    mimetype='text/csv',
                    resumable=True
                )
                
                file = drive_service.files().create(
                    body=file_metadata,
                    media_body=media,
                    fields='id, webViewLink'
                ).execute()
                
                print(f"New file created with ID: {file['id']}")

                # Add permission
                permission = drive_service.permissions().create(
                    fileId=file['id'],
                    body={
                        'type': 'user',
                        'role': 'writer',
                        'emailAddress': 'ronitkothari22@gmail.com',
                        'sendNotificationEmail': True
                    }
                ).execute()
                
                print(f"File can be viewed at: {file.get('webViewLink')}")

        except Exception as drive_error:
            print(f"Drive operation error: {str(drive_error)}")
            raise

        return {"success": True, "message": "Registration saved successfully"}

    except Exception as e:
        print(f"Error during registration: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Add a new endpoint to get the file link
@app.get("/api/registration-file")
async def get_registration_file():
    try:
        file_name = 'registrations.csv'
        response = drive_service.files().list(
            q=f"name='{file_name}'",
            spaces='drive',
            fields='files(id, webViewLink)'
        ).execute()

        if response['files']:
            file_id = response['files'][0]['id']
            file_data = drive_service.files().get(
                fileId=file_id,
                fields='webViewLink'
            ).execute()
            return {"fileUrl": file_data.get('webViewLink')}
        else:
            raise HTTPException(status_code=404, detail="File not found")

    except Exception as e:
        print(f"Error getting file link: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
