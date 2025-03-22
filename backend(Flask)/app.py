from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import re

app = Flask(__name__)
CORS(app)

# Load the model and vectorizer
model = joblib.load('naive_bayes_model.pkl')
vectorizer = joblib.load('vectorizer.pkl')

def extract_price(text):
    """Extract price based on context keywords."""
    # Convert text to lower case for consistent matching
    text = text.lower()

    # Patterns to match lines containing price-related keywords
    price_patterns = [
        r'(total\s+amount\s*[:\-]?\s*)(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
        r'(gross\s+amount\s*[:\-]?\s*)(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
        r'(net\s+amount\s*[:\-]?\s*)(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
        r'(total\s*[:\-]?\s*)(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
        r'(amount\s*[:\-]?\s*)(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)'
    ]

    for pattern in price_patterns:
        match = re.search(pattern, text)
        if match:
            price = match.group(2).replace(',', '')
            print(f"Matched Price: {price}")
            return float(price)

    # Fallback: Return the highest price if no context match found
    fallback_prices = re.findall(r'\b\d{1,3}(?:,\d{3})*(?:\.\d{2})\b', text)
    if fallback_prices:
        prices = [float(price.replace(',', '')) for price in fallback_prices]
        print(f"Fallback Prices: {prices}")
        return max(prices)

    return None

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        print("Received data:", data)

        text = data.get('text')
        if not text:
            return jsonify({'error': 'Text is required'}), 400

        # Extract price from text
        price = extract_price(text)
        if price is None:
            return jsonify({'error': 'Price not found in the text'}), 400

        # Predict category
        vectorized_text = vectorizer.transform([text])
        prediction = model.predict(vectorized_text)

        return jsonify({
            'category': prediction[0],
            'price': price
        })

    except Exception as e:
        print("Error:", str(e))
        return jsonify({'error': 'An internal error occurred'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=3333)
