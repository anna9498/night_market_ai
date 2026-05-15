import cv2
import json
import time
from ultralytics import YOLO, solutions

# 1. 初始化模型
model = YOLO("yolov8n.pt")

# 2. 開啟影片源 (0 為鏡頭)
cap = cv2.VideoCapture(0)

# 3. 初始化熱力圖插件
heatmap_obj = solutions.Heatmap(
    model="yolov8n.pt",
    show=True,
    colormap=cv2.COLORMAP_JET
)

# 👈 這裡加上了引號，修正了 SyntaxError
print("--- AI 戰情室啟動中 (按 'q' 退出) ---")

while cap.isOpened():
    success, im0 = cap.read()
    if not success:
        break

    # 執行追蹤
    tracks = model.track(im0, persist=True, classes=[0], verbose=False)
    
    # 獲取人數
    current_count = len(tracks[0].boxes) if tracks[0].boxes else 0
    
    # 4. 生成畫面
    im0 = heatmap_obj.display_frames(im0, tracks)

    # 5. 存成 JSON 讓 React 前端讀取
    stats = {
        "time": time.strftime("%H:%M:%S"),
        "actual": current_count,
        "intensity": float(im0.mean()) 
    }
    
    with open("market_stats.json", "w") as f:
        json.dump(stats, f)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()