# 🌤️ Tasmania Homestead Weather System

Live weather monitoring for Adrian's off-grid homestead using data from the Australian Bureau of Meteorology.

## 📡 Data Source

**Primary Station:** Grove (Cygnet Area)  
**BOM Station ID:** 95977  
**Coordinates:** -43.1647, 147.0584  
**Data URL:** http://reg.bom.gov.au/fwo/IDT60801/IDT60801.95977.json

## 🔄 Update Schedule

- **Automatic:** Every 3 hours via GitHub Actions
- **Manual:** Trigger via GitHub Actions workflow dispatch
- **Data Retention:** Daily snapshots archived in `daily/` folder

## 🏡 Homestead Integration

The weather system provides tailored insights for off-grid living:

### ⚡ Solar Generation Assessment
- **Optimal:** Clear/Fine conditions maximize solar output
- **Reduced:** Cloudy/Overcast conditions reduce generation

### 🌱 Garden Management
- **Natural Watering:** >5mm rainfall = no irrigation needed
- **Manual Watering:** <5mm rainfall = irrigation required

### 🔋 Power Load Prediction
- **Heating Load High:** <10°C = increased power consumption
- **Cooling Load High:** >30°C = cooling/ventilation needs
- **Normal Load:** 10-30°C = baseline consumption

## 📊 Data Visualization

ASCII bar charts show relative conditions:
- **Temperature Bar:** 0-40°C scale (█ = high, ░ = low)
- **Humidity Bar:** 0-100% scale
- **Wind Speed Bar:** 0-50 km/h scale

## 🖥️ Terminal Access

Use the `weather` command in the terminal to see:
- Current conditions with emoji indicators
- Detailed measurements with ASCII visualizations
- Homestead-specific impact assessments
- Data freshness indicators

## 📈 Historical Data

Daily weather snapshots are archived in markdown format with:
- Complete meteorological measurements
- Homestead impact analysis
- Visual data representations
- Timestamp and data provenance

## 🌍 Australian BOM Integration

Data sourced from the Bureau of Meteorology's observation network:
- Real-time automated weather station data
- Quality-controlled measurements
- Official Australian government weather service
- Comprehensive meteorological parameters

---

*"Weather awareness is survival wisdom for off-grid living."*