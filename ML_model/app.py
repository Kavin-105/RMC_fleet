from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
import re
import os
import tempfile
from PIL import Image
import cv2
import easyocr

# Initialize EasyOCR reader (English) with optimized settings
print("Loading EasyOCR model... (this may take a moment on first run)")
ocr_reader = easyocr.Reader(['en'], gpu=False, model_storage_directory=None, verbose=False)
print("EasyOCR model loaded successfully!")

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the trained model
try:
    model = joblib.load("engine_health_model.pkl")
    feature_importance = joblib.load("feature_importance.pkl")
except:
    model = None
    feature_importance = None

def analyze_parameters(data):
    """Analyze parameters and return issues with remedies"""
    rpm, oil_p, fuel_p, cool_p, oil_t, cool_t = data
    issues = []
    
    # Oil Pressure Analysis
    if oil_p < 1.5:
        issues.append({
            "severity": "CRITICAL",
            "icon": "🔴",
            "issue": "Extremely Low Oil Pressure",
            "value": f"{oil_p:.2f} bar",
            "remedy": "STOP ENGINE IMMEDIATELY! Check for oil leaks, inspect oil pump, verify oil level",
            "color": "#dc3545"
        })
    elif oil_p < 2.5:
        issues.append({
            "severity": "HIGH",
            "icon": "🟠",
            "issue": "Low Oil Pressure",
            "value": f"{oil_p:.2f} bar",
            "remedy": "Refill engine oil, check oil filter, inspect oil pump condition",
            "color": "#fd7e14"
        })
    
    # Oil Temperature Analysis
    if oil_t > 100:
        issues.append({
            "severity": "CRITICAL",
            "icon": "🔴",
            "issue": "Critical Oil Temperature",
            "value": f"{oil_t:.1f}°C",
            "remedy": "STOP ENGINE! Replace oil immediately, check oil cooler, inspect lubrication system",
            "color": "#dc3545"
        })
    elif oil_t > 90:
        issues.append({
            "severity": "HIGH",
            "icon": "🟠",
            "issue": "High Oil Temperature",
            "value": f"{oil_t:.1f}°C",
            "remedy": "Change oil and filter, check oil cooler efficiency, reduce engine load",
            "color": "#fd7e14"
        })
    elif oil_t < 70:
        issues.append({
            "severity": "MEDIUM",
            "icon": "🟡",
            "issue": "Low Oil Temperature",
            "value": f"{oil_t:.1f}°C",
            "remedy": "Allow proper warm-up time, check thermostat operation",
            "color": "#ffc107"
        })
    
    # Coolant Temperature Analysis
    if cool_t > 100:
        issues.append({
            "severity": "CRITICAL",
            "icon": "🔴",
            "issue": "Engine Overheating",
            "value": f"{cool_t:.1f}°C",
            "remedy": "STOP ENGINE! Check radiator, inspect water pump, verify coolant level and quality",
            "color": "#dc3545"
        })
    elif cool_t > 90:
        issues.append({
            "severity": "HIGH",
            "icon": "🟠",
            "issue": "High Coolant Temperature",
            "value": f"{cool_t:.1f}°C",
            "remedy": "Flush and replace coolant, check radiator fans, inspect thermostat",
            "color": "#fd7e14"
        })
    
    # Coolant Pressure Analysis
    if cool_p < 1.0:
        issues.append({
            "severity": "HIGH",
            "icon": "🟠",
            "issue": "Low Coolant Pressure",
            "value": f"{cool_p:.2f} bar",
            "remedy": "Check for coolant leaks, inspect radiator cap, verify water pump operation",
            "color": "#fd7e14"
        })
    elif cool_p > 3.5:
        issues.append({
            "severity": "MEDIUM",
            "icon": "🟡",
            "issue": "High Coolant Pressure",
            "value": f"{cool_p:.2f} bar",
            "remedy": "Inspect cooling system for blockages, check radiator cap rating",
            "color": "#ffc107"
        })
    
    # Fuel Pressure Analysis
    if fuel_p < 5:
        issues.append({
            "severity": "HIGH",
            "icon": "🟠",
            "issue": "Very Low Fuel Pressure",
            "value": f"{fuel_p:.2f} bar",
            "remedy": "Check fuel pump, replace fuel filter, inspect fuel lines for blockages",
            "color": "#fd7e14"
        })
    elif fuel_p < 10:
        issues.append({
            "severity": "MEDIUM",
            "icon": "🟡",
            "issue": "Low Fuel Pressure",
            "value": f"{fuel_p:.2f} bar",
            "remedy": "Replace fuel filter, check fuel pump performance, verify fuel quality",
            "color": "#ffc107"
        })
    
    # RPM Analysis
    if rpm > 4000:
        issues.append({
            "severity": "HIGH",
            "icon": "🟠",
            "issue": "Excessive Engine RPM",
            "value": f"{rpm:.0f} RPM",
            "remedy": "Reduce engine load immediately, check throttle control, avoid over-revving",
            "color": "#fd7e14"
        })
    elif rpm > 3500:
        issues.append({
            "severity": "MEDIUM",
            "icon": "🟡",
            "issue": "High Engine RPM",
            "value": f"{rpm:.0f} RPM",
            "remedy": "Reduce load, optimize driving habits, shift to higher gear if applicable",
            "color": "#ffc107"
        })
    elif rpm < 400:
        issues.append({
            "severity": "MEDIUM",
            "icon": "🟡",
            "issue": "Very Low RPM",
            "value": f"{rpm:.0f} RPM",
            "remedy": "Check idle speed adjustment, inspect throttle body, verify air intake",
            "color": "#ffc107"
        })
    
    # Sort by severity
    severity_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
    issues.sort(key=lambda x: severity_order[x["severity"]])
    
    return issues


@app.route('/')
def index():
    """Render the main page"""
    return render_template('index.html')


@app.route('/predict', methods=['POST'])
def predict():
    """Handle prediction requests"""
    try:
        data = request.json
        
        # Extract parameters
        rpm = float(data.get('rpm', 0))
        oil_p = float(data.get('oil_pressure', 0))
        fuel_p = float(data.get('fuel_pressure', 0))
        cool_p = float(data.get('coolant_pressure', 0))
        oil_t = float(data.get('oil_temp', 0))
        cool_t = float(data.get('coolant_temp', 0))
        
        # Prepare input for model
        input_data = np.array([[rpm, oil_p, fuel_p, cool_p, oil_t, cool_t]])
        
        # Make prediction
        prediction = model.predict(input_data)[0]
        probability = model.predict_proba(input_data)[0]
        
        # Get status
        status = "HEALTHY" if prediction == 1 else "AT RISK"
        confidence = float(probability[1]) if prediction == 1 else float(probability[0])
        
        # Analyze parameters for issues
        issues = analyze_parameters([rpm, oil_p, fuel_p, cool_p, oil_t, cool_t])
        
        # Prepare response
        response = {
            'status': status,
            'confidence': round(confidence * 100, 1),
            'prediction': int(prediction),
            'issues': issues,
            'parameters': {
                'rpm': rpm,
                'oil_pressure': oil_p,
                'fuel_pressure': fuel_p,
                'coolant_pressure': cool_p,
                'oil_temp': oil_t,
                'coolant_temp': cool_t
            }
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/stats')
def get_stats():
    """Get dataset statistics"""
    try:
        df = pd.read_csv("engine_data.csv")
        
        stats = {
            'total_records': len(df),
            'healthy': int((df['Engine Condition'] == 1).sum()),
            'at_risk': int((df['Engine Condition'] == 0).sum()),
            'healthy_pct': round((df['Engine Condition'] == 1).sum() / len(df) * 100, 1),
            'at_risk_pct': round((df['Engine Condition'] == 0).sum() / len(df) * 100, 1)
        }
        
        # Get feature importance
        if feature_importance is not None:
            stats['feature_importance'] = feature_importance.to_dict('records')
        
        return jsonify(stats)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'OK',
        'model_loaded': model is not None
    })


# ================== LICENSE OCR EXTRACTION ==================

def preprocess_image(image):
    """Preprocess image for better OCR accuracy"""
    # Ensure numpy array
    if isinstance(image, Image.Image):
        image = np.array(image)
    
    # Make a copy to avoid modifying original
    img = image.copy()
    
    # Convert to grayscale if color
    if len(img.shape) == 3:
        gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    else:
        gray = img
    
    # Resize for better OCR (scale up if too small)
    height, width = gray.shape[:2]
    if width < 1000:
        scale = 1000 / width
        gray = cv2.resize(gray, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)
    
    # Apply slight blur to reduce noise
    gray = cv2.GaussianBlur(gray, (3, 3), 0)
    
    # Apply adaptive thresholding for better text visibility
    binary = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
        cv2.THRESH_BINARY, 11, 2
    )
    
    return binary


def extract_license_number(text):
    """Extract Indian driving license number from OCR text"""
    
    # Indian DL format patterns:
    # Old format: XX-YYYYNNNNNNN (e.g., MH-1220220012345)
    # New format: XX-YYNNNNNNNNNNN (e.g., MH-0619880123456)
    # Variations: XXNN YYYYNNNNNNN, XX/NN/YYYY/NNNNNNN
    
    patterns = [
        # Standard format: MH-1220220012345 or MH1220220012345
        r'[A-Z]{2}[-\s]?\d{2}[-\s]?\d{4}[-\s]?\d{7}',
        # Format: MH-12 20220012345
        r'[A-Z]{2}[-\s]?\d{2}[-\s]?\d{11}',
        # Format: MH/12/2022/0012345
        r'[A-Z]{2}[/\-]\d{2}[/\-]\d{4}[/\-]\d{7}',
        # Shorter format: MH12 2019 0123456
        r'[A-Z]{2}[-\s]?\d{2}[-\s]?\d{4}[-\s]?\d{6,7}',
        # Very flexible: captures XX followed by 12-15 digits
        r'[A-Z]{2}[-\s/]?\d{13,17}',
        # Alternative: XX-NN-NNNNNNNNNNN
        r'[A-Z]{2}[-\s]?\d{2}[-\s]?\d{10,13}',
    ]
    
    # Clean text - remove extra whitespace and newlines
    text = ' '.join(text.upper().split())
    
    for pattern in patterns:
        matches = re.findall(pattern, text)
        if matches:
            # Return the first valid match, cleaned up
            license_num = matches[0]
            # Standardize format: remove spaces, keep hyphens
            license_num = re.sub(r'\s+', '', license_num)
            # Ensure proper hyphen placement: XX-NNNNNNNNNNNNN
            if len(license_num) >= 15 and not '-' in license_num[:3]:
                license_num = license_num[:2] + '-' + license_num[2:]
            return license_num
    
    return None


def extract_expiry_date(text):
    """Extract license expiry date from OCR text"""
    from datetime import datetime
    
    text_upper = text.upper()
    
    # Tamil Nadu DL format detection:
    # Headers like "ISSUE DATE VALIDITY (NT) VALIDITY (TR)" followed by dates "12-02-2025 12-10-2045"
    # In this format, first date is issue date, second is validity (expiry)
    
    # Check for Tamil Nadu format: ISSUE DATE ... VALIDITY ... followed by multiple dates
    tn_format = re.search(r'ISSUE\s*DATE.*?VALIDITY.*?(\d{2}[-/]\d{2}[-/]\d{4}).*?(\d{2}[-/]\d{2}[-/]\d{4})', text_upper)
    if tn_format:
        issue_date = tn_format.group(1).replace('/', '-')
        expiry_date = tn_format.group(2).replace('/', '-')
        print(f"[OCR] Tamil Nadu format detected - Issue: {issue_date}, Validity: {expiry_date}")
        return expiry_date
    
    # Find ALL dates first
    all_dates_pattern = r'(\d{2}[-/]\d{2}[-/]\d{4})'
    all_dates = re.findall(all_dates_pattern, text_upper)
    
    if all_dates:
        parsed_dates = []
        
        for date_str in all_dates:
            date_str_clean = date_str.replace('/', '-')
            try:
                # Try DD-MM-YYYY format (Indian standard)
                parsed = datetime.strptime(date_str_clean, '%d-%m-%Y')
                parsed_dates.append((parsed, date_str_clean))
            except ValueError:
                continue
        
        if parsed_dates:
            # Sort by date descending - get the FURTHEST date (expiry is always furthest in future)
            parsed_dates.sort(key=lambda x: x[0], reverse=True)
            expiry = parsed_dates[0][1]
            print(f"[OCR] Expiry date (furthest future): {expiry}")
            return expiry
    
    print("[OCR] No expiry date found")
    return None


@app.route('/extract-license', methods=['POST'])
def extract_license():
    """Extract license number from uploaded image or PDF"""
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        # Get file extension
        filename = file.filename.lower()
        
        # Save file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(filename)[1]) as tmp:
            file.save(tmp.name)
            tmp_path = tmp.name
        
        try:
            extracted_text = ""
            
            if filename.endswith('.pdf'):
                # Handle PDF files using PyMuPDF
                try:
                    import fitz  # PyMuPDF
                    import time
                    start_time = time.time()
                    
                    print(f"\n{'='*50}")
                    print(f"[OCR] Processing PDF: {filename}")
                    
                    # Open PDF
                    pdf_document = fitz.open(tmp_path)
                    
                    # Only process first page (license is usually on first page)
                    page = pdf_document[0]
                    
                    # Render at 2x zoom (balance between quality and speed)
                    mat = fitz.Matrix(2.0, 2.0)
                    pix = page.get_pixmap(matrix=mat)
                    
                    # Convert to PIL Image
                    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                    
                    # Resize if too large
                    max_width = 1200
                    if img.width > max_width:
                        ratio = max_width / img.width
                        new_size = (max_width, int(img.height * ratio))
                        img = img.resize(new_size, Image.LANCZOS)
                    
                    img_array = np.array(img)
                    print(f"[OCR] Image size: {img_array.shape}")
                    
                    # Perform OCR once with optimized settings
                    results = ocr_reader.readtext(img_array, paragraph=False, batch_size=4)
                    extracted_text = ' '.join([result[1] for result in results])
                    
                    pdf_document.close()
                    
                    ocr_time = time.time() - start_time
                    print(f"[OCR] Text extraction completed in {ocr_time:.2f}s")
                    
                except ImportError as e:
                    print(f"PyMuPDF import error: {e}")
                    return jsonify({
                        'success': False, 
                        'error': 'PDF processing library not available. Please upload an image instead.'
                    }), 400
                except Exception as e:
                    print(f"PDF processing error: {e}")
                    return jsonify({
                        'success': False, 
                        'error': f'Error processing PDF: {str(e)}'
                    }), 400
            else:
                # Handle image files
                import time
                start_time = time.time()
                
                image = Image.open(tmp_path)
                # Convert to RGB if necessary
                if image.mode != 'RGB':
                    image = image.convert('RGB')
                
                # Resize image for faster processing (max 1200px width)
                max_width = 1200
                if image.width > max_width:
                    ratio = max_width / image.width
                    new_size = (max_width, int(image.height * ratio))
                    image = image.resize(new_size, Image.LANCZOS)
                
                # Convert to numpy array
                img_array = np.array(image)
                
                print(f"\n{'='*50}")
                print(f"[OCR] Processing image: {filename}")
                print(f"[OCR] Image size: {img_array.shape}")
                
                # Perform OCR with speed optimizations
                results = ocr_reader.readtext(img_array, paragraph=False, batch_size=4)
                extracted_text = ' '.join([result[1] for result in results])
                
                ocr_time = time.time() - start_time
                print(f"[OCR] Text extraction completed in {ocr_time:.2f}s")
            
            # Extract license number and expiry
            license_number = extract_license_number(extracted_text)
            expiry_date = extract_expiry_date(extracted_text)
            
            # Print results cleanly
            print(f"\n{'='*50}")
            print(f"[RESULT] License Number: {license_number or 'Not found'}")
            print(f"[RESULT] Expiry Date: {expiry_date or 'Not found'}")
            print(f"{'='*50}\n")
            
            if license_number:
                response = {
                    'success': True,
                    'licenseNumber': license_number,
                    'expiryDate': expiry_date,
                    'rawText': extracted_text[:500] if len(extracted_text) > 500 else extracted_text
                }
            else:
                response = {
                    'success': False,
                    'error': 'Could not extract license number. Please ensure the image is clear and try again.',
                    'rawText': extracted_text[:500] if len(extracted_text) > 500 else extracted_text
                }
            
            return jsonify(response)
            
        finally:
            # Clean up temp file
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
                
    except Exception as e:
        print(f"Error in extract_license: {str(e)}")  # Debug log
        return jsonify({'success': False, 'error': str(e)}), 500


if __name__ == '__main__':
    print("="*60)
    print("🚀 ENGINE HEALTH PREDICTION & LICENSE OCR WEB APPLICATION")
    print("="*60)
    print("\n✓ Server starting...")
    print("✓ Open your browser and navigate to:")
    print("\n   👉 http://localhost:5001")
    print("\n   Available endpoints:")
    print("   - /predict - Engine health prediction")
    print("   - /extract-license - License number OCR extraction")
    print("\n" + "="*60)
    app.run(debug=False, host='0.0.0.0', port=5001, threaded=True)
