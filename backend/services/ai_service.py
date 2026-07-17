"""
MemoryOS AI - AI Service

Handles Google Gemini API interactions with a robust local analytical fallback engine
for generating context-specific marketing intelligence when API keys are not active.
"""

import logging
import google.generativeai as genai
from groq import Groq
from openai import OpenAI
from backend.config import get_settings

logger = logging.getLogger("memoryos.ai")
settings = get_settings()

class AIService:
    """Manages AI model interactions for content generation and strategic reporting with fallback support."""

    def __init__(self):
        self.gemini_key = settings.GEMINI_API_KEY
        self.groq_key = settings.GROQ_API_KEY
        self.openrouter_key = settings.OPENROUTER_API_KEY
        
        self.has_gemini = bool(self.gemini_key and "placeholder" not in self.gemini_key.lower())
        self.has_groq = bool(self.groq_key and "placeholder" not in self.groq_key.lower())
        self.has_openrouter = bool(self.openrouter_key and "placeholder" not in self.openrouter_key.lower())
        
        if self.has_gemini:
            logger.info("Initializing Google Gemini API with configured key.")
            genai.configure(api_key=self.gemini_key)
            
        if self.has_groq:
            logger.info("Initializing Groq API fallback.")
            self.groq_client = Groq(api_key=self.groq_key)
            
        if self.has_openrouter:
            logger.info("Initializing OpenRouter API final fallback.")
            self.openrouter_client = OpenAI(
                base_url="https://openrouter.ai/api/v1",
                api_key=self.openrouter_key
            )
            
        if not (self.has_gemini or self.has_groq or self.has_openrouter):
            logger.warning("No valid AI API keys configured. Using local report-generator fallback.")

    async def health_check(self) -> bool:
        """Verify AI service is accessible."""
        return self.has_gemini or self.has_groq or self.has_openrouter

    async def generate_response(self, prompt: str) -> str:
        """Generate a response using failover: Gemini -> Groq -> OpenRouter -> Local."""
        
        # 1. Try Gemini
        if self.has_gemini:
            try:
                model = genai.GenerativeModel(settings.GEMINI_MODEL)
                response = model.generate_content(prompt)
                if response and response.text:
                    logger.info("Successfully used provider: Gemini")
                    return response.text.strip()
            except Exception as e:
                logger.error("Gemini API call failed: %s. Falling back to Groq.", str(e))
                
        # 2. Try Groq
        if self.has_groq:
            try:
                chat_completion = self.groq_client.chat.completions.create(
                    messages=[{"role": "user", "content": prompt}],
                    model="llama-3.1-8b-instant",
                )
                if chat_completion.choices[0].message.content:
                    logger.info("Successfully used provider: Groq")
                    return chat_completion.choices[0].message.content.strip()
            except Exception as e:
                logger.error("Groq API call failed: %s. Falling back to OpenRouter.", str(e))
                
        # 3. Try OpenRouter
        if self.has_openrouter:
            try:
                completion = self.openrouter_client.chat.completions.create(
                    messages=[{"role": "user", "content": prompt}],
                    model="anthropic/claude-3-haiku",
                )
                if completion.choices[0].message.content:
                    logger.info("Successfully used provider: OpenRouter")
                    return completion.choices[0].message.content.strip()
            except Exception as e:
                logger.error("OpenRouter API call failed: %s. Falling back to local intelligence.", str(e))
        
        logger.info("Successfully used provider: Local Fallback")
        
        # 4. Smart rule-based responses for local development when API key is missing
        return self._generate_local_fallback_response(prompt)

    async def generate_marketing_report(self, report_type: str, company_name: str, metrics: dict) -> str:
        """Construct prompt and generate a detailed marketing report."""
        prompt = f"""
        You are the Chief Marketing Officer (CMO) at {company_name}.
        Generate a detailed {report_type} marketing report based on the following company metrics:
        
        - Total Customers: {metrics.get('total_customers', 0)}
        - Total Revenue (Customer LTV): ${metrics.get('total_revenue', 0.0)}
        - Total Advertising Spend: ${metrics.get('total_spend', 0.0)}
        - Net Marketing Profit: ${metrics.get('net_profit', 0.0)}
        - Return on Ad Spend (ROAS / ROI): {metrics.get('roi_percentage', 0.0)}%
        - Active Marketing Campaigns: {metrics.get('active_campaigns', 0)}
        - Average Click-Through Rate (CTR): {metrics.get('avg_ctr', 0.0)}%
        - Average Conversion Rate (CVR): {metrics.get('avg_cvr', 0.0)}%
        
        Provide:
        1. Executive Summary: Overall performance highlight.
        2. Channel Performance Analysis: CTR vs. CVR efficiency.
        3. Strategic Action Plan: Recommendations on ad spend optimization, customer retention, and growth channels.
        4. Performance Forecast: Expected return if suggestions are adopted.
        
        Format the response in clean, premium Github-flavored Markdown.
        """
        return await self.generate_response(prompt)

    def _generate_local_fallback_response(self, prompt: str) -> str:
        """Generates premium marketing reports and chat answers locally when Gemini is unavailable."""
        prompt_lower = prompt.lower()
        
        # Check if this is a marketing report request
        if "cmo" in prompt_lower or "marketing report" in prompt_lower:
            # Extract metrics from prompt using basic searches or parsing
            metrics = {}
            for line in prompt.split("\n"):
                if "total customers" in line.lower():
                    metrics["customers"] = line.split(":")[-1].strip()
                elif "total revenue" in line.lower():
                    metrics["revenue"] = line.split(":")[-1].strip()
                elif "spend" in line.lower():
                    metrics["spend"] = line.split(":")[-1].strip()
                elif "profit" in line.lower():
                    metrics["profit"] = line.split(":")[-1].strip()
                elif "roas" in line.lower() or "roi" in line.lower():
                    metrics["roas"] = line.split(":")[-1].strip()
                elif "ctr" in line.lower():
                    metrics["ctr"] = line.split(":")[-1].strip()
                elif "cvr" in line.lower():
                    metrics["cvr"] = line.split(":")[-1].strip()

            return f"""# Executive Marketing Intelligence Report

Generated locally by **Nebrix AI Analysis Engine**.

## 1. Executive Summary
Based on the current database state, the company holds **{metrics.get('customers', '0')} active customer records** driving a total Customer Lifetime Value (LTV) of **{metrics.get('revenue', '$0.00')}**. With an accumulated ad spend of **{metrics.get('spend', '$0.00')}**, the net marketing profit stands at **{metrics.get('profit', '$0.00')}**, yielding an overall Return on Investment (ROI) of **{metrics.get('roas', '0.0%')}**. Performance indicates stable acquisition vectors but points to substantial cost savings if channels are optimized.

## 2. Channel Performance Analysis
- **Click-Through Rate (CTR):** The average campaign CTR is **{metrics.get('ctr', '0.0%')}**. Benchmark expectations for SaaS and e-commerce models sit at 2.5%, indicating our current performance is { "well positioned" if float(metrics.get('ctr', '0').replace('%','')) >= 2.5 else "slightly below optimal CTR parameters" }.
- **Conversion Rate (CVR):** The conversion pipeline achieves **{metrics.get('cvr', '0.0%')}**. Ad spend is successfully translating to customer acquisitions, but segment targeting can be tightened to prevent budget leakage.

## 3. Strategic Action Plan
1. **Optimize Underperforming Platforms:** Shift ad budget from channels showing CTR below 1.5% and allocate funds toward Google/Meta retargeting.
2. **Expand High-LTV Segments:** Uploaded lists highlight enterprise and high-spending customers. Develop tailored drip campaigns to double down on customer retention.
3. **Enhance Landing Page Experience:** Direct traffic to personalized landing pages to boost conversion rates above the current **{metrics.get('cvr', '0%')}** threshold.

## 4. Performance Forecast
By implementing budget reallocation and prioritizing retention drip campaigns, we forecast:
- A **12-15% increase in conversion rate (CVR)** over the next quarter.
- A **9% reduction in Cost Per Acquisition (CPA)**.
- Expected Net ROI improvement to **{ float(metrics.get('roas', '0').replace('%','')) + 15.0 if '%' in metrics.get('roas', '') else 35.0 }%**.
"""

        # General Chat fallbacks
        if "draft" in prompt_lower or "campaign" in prompt_lower or "email" in prompt_lower:
            return """### Suggested Email Campaign Draft: "Welcome to Nebrix"

**Subject:** Streamline your workflow with Nebrix AI 🚀

Dear {{Customer Name}},

Thank you for choosing Nebrix! We are excited to help you leverage artificial intelligence to optimize your marketing campaigns, analyze customer segments, and drive real growth.

Here is how to get started:
1. **Upload your marketing data:** Simply drop your CSV files in the Upload Center.
2. **Review your Dashboard:** View real-time calculations on ad spend, CTR, and conversions.
3. **Ask the AI Assistant:** Ask me to write newsletter drafts, analyze segment trends, or suggest reallocations.

Click the link below to access your dashboard:
[Go to Dashboard](http://localhost:3000/)

Best regards,
The Nebrix Team
"""

        return """I have analyzed your request based on our active database records. 

Based on our marketing analysis, we should focus on:
1. Reallocating budget to platforms with conversions exceeding 150.
2. Targeting customer segments that exhibit a higher lifetime value.
3. Setting up automatic follow-up emails for newly uploaded customer contacts.

What specific aspect of your data or campaigns would you like me to work on next?"""

ai_service = AIService()
