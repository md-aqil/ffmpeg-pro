# Graph Report - /Users/mdaqil/Documents/ffmpeg-pro  (2026-04-21)

## Corpus Check
- 48 files · ~3,136,877 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 188 nodes · 201 edges · 42 communities detected
- Extraction: 84% EXTRACTED · 16% INFERRED · 0% AMBIGUOUS · INFERRED: 32 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]

## God Nodes (most connected - your core abstractions)
1. `VideoEditorService` - 11 edges
2. `getFileExtension()` - 10 edges
3. `getFileExtension()` - 8 edges
4. `FFmpegCommandBuilder` - 8 edges
5. `convertAudioFile()` - 5 edges
6. `extractAudioFromVideo()` - 5 edges
7. `mixAudioFiles()` - 5 edges
8. `convertFile()` - 5 edges
9. `getSupportedAudioOutputFormats()` - 5 edges
10. `BatchProcessor` - 5 edges

## Surprising Connections (you probably didn't know these)
- `fileFilter()` --calls--> `isSupportedFormat()`  [INFERRED]
  /Users/mdaqil/Documents/ffmpeg-pro/server/middleware/uploadMiddleware.js → /Users/mdaqil/Documents/ffmpeg-pro/server/utils/fileUtils.js
- `getFileExtension()` --calls--> `convertFile()`  [INFERRED]
  /Users/mdaqil/Documents/ffmpeg-pro/server/utils/fileUtils.js → /Users/mdaqil/Documents/ffmpeg-pro/server/controllers/convertController.js
- `convertAudioFile()` --calls--> `convertAudio()`  [INFERRED]
  /Users/mdaqil/Documents/ffmpeg-pro/server/controllers/audioController.js → /Users/mdaqil/Documents/ffmpeg-pro/server/services/audioService.js
- `extractAudioFromVideo()` --calls--> `extractAudio()`  [INFERRED]
  /Users/mdaqil/Documents/ffmpeg-pro/server/controllers/audioController.js → /Users/mdaqil/Documents/ffmpeg-pro/server/services/audioService.js
- `mixAudioFiles()` --calls--> `mixAudio()`  [INFERRED]
  /Users/mdaqil/Documents/ffmpeg-pro/server/controllers/audioController.js → /Users/mdaqil/Documents/ffmpeg-pro/server/services/audioService.js

## Communities

### Community 0 - "Community 0"
Cohesion: 0.13
Nodes (19): applyAudioEffects(), applyAudioEffectsToFile(), convertAudioFile(), extractAudioFromVideo(), getAudioFormats(), mixAudioFiles(), trimAudioFile(), convertAudio() (+11 more)

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (0): 

### Community 2 - "Community 2"
Cohesion: 0.17
Nodes (5): applyImageEffects(), BatchProcessor, convertWithQuality(), FFmpegCommandBuilder, resizeWithFilters()

### Community 3 - "Community 3"
Cohesion: 0.18
Nodes (5): formatBytes(), formatDimension(), ImagePage(), simplifyAspectRatio(), ImagePropertiesSidebar()

### Community 4 - "Community 4"
Cohesion: 0.15
Nodes (0): 

### Community 5 - "Community 5"
Cohesion: 0.29
Nodes (1): VideoEditorService

### Community 6 - "Community 6"
Cohesion: 0.27
Nodes (7): convertFile(), getFileMetadata(), getFormats(), convertVideo(), getSupportedInputFormats(), getSupportedOutputFormats(), getVideoMetadata()

### Community 7 - "Community 7"
Cohesion: 0.29
Nodes (0): 

### Community 8 - "Community 8"
Cohesion: 0.5
Nodes (2): formatBytes(), StudioPage()

### Community 9 - "Community 9"
Cohesion: 0.83
Nodes (3): cleanupDirectory(), cleanupOldFiles(), startCleanupInterval()

### Community 10 - "Community 10"
Cohesion: 0.83
Nodes (3): formatBytes(), InspectorSidebar(), summarizeOperation()

### Community 11 - "Community 11"
Cohesion: 0.67
Nodes (1): fileFilter()

### Community 12 - "Community 12"
Cohesion: 0.67
Nodes (1): Header()

### Community 13 - "Community 13"
Cohesion: 1.0
Nodes (0): 

### Community 14 - "Community 14"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "Community 15"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "Community 16"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "Community 17"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Community 18"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Community 19"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Community 20"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Community 21"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Community 22"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Community 23"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Community 25"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Community 26"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Community 29"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "Community 30"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Community 31"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Community 32"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Community 33"
Cohesion: 1.0
Nodes (0): 

### Community 34 - "Community 34"
Cohesion: 1.0
Nodes (0): 

### Community 35 - "Community 35"
Cohesion: 1.0
Nodes (0): 

### Community 36 - "Community 36"
Cohesion: 1.0
Nodes (0): 

### Community 37 - "Community 37"
Cohesion: 1.0
Nodes (0): 

### Community 38 - "Community 38"
Cohesion: 1.0
Nodes (0): 

### Community 39 - "Community 39"
Cohesion: 1.0
Nodes (0): 

### Community 40 - "Community 40"
Cohesion: 1.0
Nodes (0): 

### Community 41 - "Community 41"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Community 13`** (2 nodes): `testPipeline()`, `pipeline.test.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (2 nodes): `reportWebVitals()`, `reportWebVitals.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (2 nodes): `App()`, `App.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (2 nodes): `Navbar()`, `Navbar.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (2 nodes): `TransformationCard()`, `ImageConverter.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (2 nodes): `RightSidebar()`, `RightSidebar.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (2 nodes): `ThemeToggle()`, `ThemeToggle.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (2 nodes): `Toast()`, `Toast.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (2 nodes): `LeftSidebar()`, `LeftSidebar.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (2 nodes): `PipelinePanel()`, `PipelinePanel.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (2 nodes): `ImageCanvas()`, `ImageCanvas.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (2 nodes): `BottomStatus()`, `BottomStatus.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (2 nodes): `VideoEditorPage.js`, `VideoEditorPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (2 nodes): `VideoPage.js`, `VideoPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (2 nodes): `AudioPage()`, `AudioPage.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (1 nodes): `ecosystem.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (1 nodes): `server.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (1 nodes): `app.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (1 nodes): `ffmpegConfig.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (1 nodes): `imageRoutes.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (1 nodes): `uploadRoutes.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (1 nodes): `convertRoutes.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (1 nodes): `audioRoutes.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (1 nodes): `tailwind.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (1 nodes): `postcss.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (1 nodes): `index.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (1 nodes): `setupTests.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (1 nodes): `VideoConverter.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (1 nodes): `AudioConverter.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getFileExtension()` connect `Community 0` to `Community 3`, `Community 6`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Why does `applyAudioEffects()` connect `Community 0` to `Community 1`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `getFileExtension()` (e.g. with `uploadFile()` and `convertAudioFile()`) actually correct?**
  _`getFileExtension()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `getFileExtension()` (e.g. with `uploadFile()` and `convertAudioFile()`) actually correct?**
  _`getFileExtension()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `convertAudioFile()` (e.g. with `getSupportedAudioOutputFormats()` and `getFileExtension()`) actually correct?**
  _`convertAudioFile()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._