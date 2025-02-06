from fastapi import FastAPI, HTTPException, Request, BackgroundTasks
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
import json
from dotenv import load_dotenv
from collections import defaultdict

# Load environment variables
load_dotenv()

app = FastAPI()

# Configure OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

# Rate limiting storage - using stall number instead of IP
stall_usage = defaultdict(int)
GENERATION_LIMIT = 3

# Configure CORS
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Google Drive API setup
SCOPES = ['https://www.googleapis.com/auth/drive.file']

# Get Google credentials from environment variable
GOOGLE_CREDENTIALS = os.getenv("GOOGLE_CREDENTIALS")
if GOOGLE_CREDENTIALS:
    creds_dict = json.loads(GOOGLE_CREDENTIALS)
    credentials = service_account.Credentials.from_service_account_info(
        creds_dict, scopes=SCOPES
    )
else:
    SERVICE_ACCOUNT_FILE = os.path.join(os.path.dirname(__file__), 'credentials.json')
    try:
        credentials = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE, scopes=SCOPES
        )
    except Exception as e:
        print(f"Error setting up Google Drive credentials: {e}")

try:
    drive_service = build('drive', 'v3', credentials=credentials)
except Exception as e:
    print(f"Error building drive service: {e}")

class RegistrationData(BaseModel):
    name: str
    email: str
    stallNo: str

class ImagePrompt(BaseModel):
    prompt: str
    stallNo: str

# Function to update Google Drive in the background
async def update_drive_registration(data: dict):
    try:
        new_registration = pd.DataFrame([data])
        file_name = 'registrations.csv'
        
        response = drive_service.files().list(
            q=f"name='{file_name}'",
            spaces='drive',
            fields='files(id, name, webViewLink)'
        ).execute()

        if response['files']:
            file_id = response['files'][0]['id']
            try:
                request = drive_service.files().get_media(fileId=file_id)
                existing_content = request.execute()
                existing_df = pd.read_csv(io.StringIO(existing_content.decode('utf-8')))
                updated_df = pd.concat([existing_df, new_registration], ignore_index=True)
            except:
                updated_df = new_registration

            # Save to Drive
            csv_buffer = io.StringIO()
            updated_df.to_csv(csv_buffer, index=False)
            media = MediaIoBaseUpload(
                io.BytesIO(csv_buffer.getvalue().encode()),
                mimetype='text/csv',
                resumable=True
            )

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

            # Add permission for new file
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

    except Exception as e:
        print(f"Background task error: {str(e)}")

@app.post("/api/register")
async def register_user(data: RegistrationData):
    try:
        # Prepare registration data
        registration_data = {
            'Timestamp': datetime.now().isoformat(),
            'Name': data.name,
            'Email': data.email,
            'Stall_No': data.stallNo
        }

        file_name = 'registrations.csv'
        new_registration = pd.DataFrame([registration_data])
        
        # First, check if file exists
        response = drive_service.files().list(
            q=f"name='{file_name}'",
            spaces='drive',
            fields='files(id, name)'
        ).execute()

        try:
            if response['files']:
                # File exists, update it
                file_id = response['files'][0]['id']
                print(f"\nExisting file found with ID: {file_id}")
                
                try:
                    # Get existing content
                    request = drive_service.files().get_media(fileId=file_id)
                    existing_content = request.execute()
                    existing_df = pd.read_csv(io.StringIO(existing_content.decode('utf-8')))
                    print("Successfully read existing file")
                    
                    # Append new registration
                    updated_df = pd.concat([existing_df, new_registration], ignore_index=True)
                except Exception as read_error:
                    print(f"Error reading existing file: {str(read_error)}")
                    print("Creating new file with just this registration")
                    updated_df = new_registration
                
                # Save updated content
                csv_buffer = io.StringIO()
                updated_df.to_csv(csv_buffer, index=False)
                media = MediaIoBaseUpload(
                    io.BytesIO(csv_buffer.getvalue().encode()),
                    mimetype='text/csv',
                    resumable=True
                )
                
                # Update the file
                updated_file = drive_service.files().update(
                    fileId=file_id,
                    media_body=media
                ).execute()
                print("File updated successfully")

            else:
                print("\nNo existing file found. Creating new file.")
                # Create new file
                csv_buffer = io.StringIO()
                new_registration.to_csv(csv_buffer, index=False)
                
                file_metadata = {
                    'name': file_name,
                    'mimeType': 'text/csv'
                }
                
                media = MediaIoBaseUpload(
                    io.BytesIO(csv_buffer.getvalue().encode()),
                    mimetype='text/csv',
                    resumable=True
                )
                
                # Create the file
                file = drive_service.files().create(
                    body=file_metadata,
                    media_body=media,
                    fields='id'
                ).execute()
                
                file_id = file.get('id')
                print(f"New file created with ID: {file_id}")

            # Ensure permission exists for the admin email
            try:
                permission = drive_service.permissions().create(
                    fileId=file_id,
                    body={
                        'type': 'user',
                        'role': 'writer',
                        'emailAddress': 'ronitkothari22@gmail.com'
                    }
                ).execute()
                print("Permission added successfully")
            except Exception as perm_error:
                print(f"Permission error: {str(perm_error)}")

            # Get and print the file's web link
            file_data = drive_service.files().get(
                fileId=file_id,
                fields='webViewLink'
            ).execute()
            print("\n=== REGISTRATION SPREADSHEET ===")
            print(f"Admin access link: {file_data.get('webViewLink')}")
            print("================================\n")

            return {"success": True, "message": "Registration successful"}

        except Exception as drive_error:
            print(f"\nDrive operation error: {str(drive_error)}")
            raise HTTPException(status_code=500, detail="Error saving registration")

    except Exception as e:
        print(f"\nError during registration: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-image")
async def generate_image(data: ImagePrompt):
    # Check if stall has reached generation limit
    if stall_usage[data.stallNo] >= GENERATION_LIMIT:
        raise HTTPException(
            status_code=429,
            detail=f"This stall has reached the limit of {GENERATION_LIMIT} image generations for this competition."
        )
    
    try:
        # First, get the registration details for this stall number
        file_name = 'registrations.csv'
        reg_response = drive_service.files().list(
            q=f"name='{file_name}'",
            spaces='drive',
            fields='files(id, name)'
        ).execute()

        if not reg_response['files']:
            raise HTTPException(status_code=400, detail="Please register first before generating images")

        file_id = reg_response['files'][0]['id']
        request = drive_service.files().get_media(fileId=file_id)
        existing_content = request.execute()
        df = pd.read_csv(io.StringIO(existing_content.decode('utf-8')))
        
        # Find the registration for this stall number
        stall_registration = df[df['Stall_No'] == data.stallNo]
        if stall_registration.empty:
            raise HTTPException(status_code=400, detail="Stall number not found in registrations")
        
        # Get the registered name
        registered_name = stall_registration.iloc[-1]['Name']
        registered_email = stall_registration.iloc[-1]['Email']

        # Generate image
        response = openai.images.generate(
            model="dall-e-3",
            prompt=data.prompt,
            size="1024x1024",
            quality="standard",
            n=1,
        )
        
        image_url = response.data[0].url
        
        # Increment the usage counter for this stall
        stall_usage[data.stallNo] += 1

        # Add new row for this generation with user details
        new_row = pd.DataFrame([{
            'Timestamp': datetime.now().isoformat(),
            'Name': registered_name,
            'Email': registered_email,
            'Stall_No': data.stallNo,
            'Prompt': data.prompt,
            'Generated_Image_URL': image_url,
            'Generation_Number': stall_usage[data.stallNo]
        }])
        
        # Append the new row
        updated_df = pd.concat([df, new_row], ignore_index=True)
        
        # Save updated CSV
        csv_buffer = io.StringIO()
        updated_df.to_csv(csv_buffer, index=False)
        media = MediaIoBaseUpload(
            io.BytesIO(csv_buffer.getvalue().encode()),
            mimetype='text/csv',
            resumable=True
        )
        
        drive_service.files().update(
            fileId=file_id,
            media_body=media
        ).execute()

        print(f"\n=== New Image Generation ===")
        print(f"Stall: {data.stallNo}")
        print(f"User: {registered_name}")
        print(f"Generation #{stall_usage[data.stallNo]}")
        print("==========================\n")

        return {
            "success": True, 
            "imageUrl": image_url,
            "remainingGenerations": GENERATION_LIMIT - stall_usage[data.stallNo]
        }
    except Exception as e:
        print(f"Error generating image: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Add an endpoint to check remaining generations for a stall
@app.get("/check-generation-limit/{stall_no}")
async def check_limit(stall_no: str):
    remaining = max(0, GENERATION_LIMIT - stall_usage[stall_no])
    return {
        "remaining_generations": remaining,
        "total_generations": GENERATION_LIMIT,
        "used_generations": stall_usage[stall_no]
    }

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

# Admin endpoint to get registration file link in terminal
@app.get("/admin/get-spreadsheet")
async def admin_get_spreadsheet():
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
            print("\n=== ADMIN: REGISTRATION SPREADSHEET ===")
            print(f"Access link: {file_data.get('webViewLink')}")
            print("=======================================\n")
            return {"message": "Spreadsheet link has been printed to the terminal"}
        else:
            print("\n=== ADMIN: NO SPREADSHEET FOUND ===")
            print("No registration spreadsheet exists yet")
            print("===================================\n")
            raise HTTPException(status_code=404, detail="File not found")

    except Exception as e:
        print(f"Error getting file link: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
