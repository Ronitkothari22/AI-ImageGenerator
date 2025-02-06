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
import openai
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Configure OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

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

class ImagePrompt(BaseModel):
    prompt: str

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
                    fields='id'
                ).execute()

        except Exception as drive_error:
            print(f"Drive operation error: {str(drive_error)}")
            raise

        return {"success": True, "message": "Registration saved successfully"}

    except Exception as e:
        print(f"Error during registration: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-image")
async def generate_image(data: ImagePrompt):
    try:
        response = openai.images.generate(
            model="dall-e-3",
            prompt=data.prompt,
            size="1024x1024",
            quality="standard",
            n=1,
        )
        
        image_url = response.data[0].url

        # Update the registration in Google Drive with prompt and image URL
        file_name = 'registrations.csv'
        response = drive_service.files().list(
            q=f"name='{file_name}'",
            spaces='drive',
            fields='files(id, name)'
        ).execute()

        if response['files']:
            file_id = response['files'][0]['id']
            request = drive_service.files().get_media(fileId=file_id)
            existing_content = request.execute()
            df = pd.read_csv(io.StringIO(existing_content.decode('utf-8')))
            
            # Update the last row with prompt and image URL
            if not df.empty:
                df.loc[df.index[-1], 'Prompt'] = data.prompt
                df.loc[df.index[-1], 'Generated_Image_URL'] = image_url
                
                # Save updated CSV
                csv_buffer = io.StringIO()
                df.to_csv(csv_buffer, index=False)
                media = MediaIoBaseUpload(
                    io.BytesIO(csv_buffer.getvalue().encode()),
                    mimetype='text/csv',
                    resumable=True
                )
                
                drive_service.files().update(
                    fileId=file_id,
                    media_body=media
                ).execute()

        return {"success": True, "imageUrl": image_url}
    except Exception as e:
        print(f"Error generating image: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
