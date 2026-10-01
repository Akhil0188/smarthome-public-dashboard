# Public Smart Home Dashboard

A read-only public dashboard for your ESP32 + Blynk IoT prototype.

## Run locally on Windows

1. Install Python 3.10+.
2. Open this folder in VS Code.
3. Open Terminal and run:

   ```powershell
   py -m venv .venv
   .venv\Scripts\activate
   pip install -r requirements.txt
   $env:BLYNK_AUTH_TOKEN="YOUR_DEVICE_AUTH_TOKEN"
   $env:BLYNK_SERVER="blr1.blynk.cloud"
   python app.py
   ```

4. Open http://127.0.0.1:5000

Do not put your Auth Token in HTML or JavaScript, and do not publish it in a public repository.

## Deploy to Render

1. Upload this project to a private or public GitHub repository. Never include your token.
2. In Render, create a new Web Service from the repository.
3. Use the settings in `render.yaml`, or set:
   - Build command: `pip install -r requirements.txt`
   - Start command: `gunicorn app:app`
4. In the service's Environment settings, add:
   - `BLYNK_AUTH_TOKEN` = your device's Blynk Auth Token
   - `BLYNK_SERVER` = `blr1.blynk.cloud`
5. Deploy. Render will provide a public URL you can share.

The dashboard is public and read-only. Anyone with the link can see the values it displays. Because this prototype currently uses simulated readings, label the data as simulated in any presentation. Do not use this public page for real home security data.

If the Blynk API response format or access policy changes, the `/api/data` endpoint may need adjustment.
