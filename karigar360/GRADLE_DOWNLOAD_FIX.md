# Fix: "java.io.IOException: failed to download remote update"

This error occurs when Gradle cannot download dependencies or updates from remote repositories. Here are comprehensive solutions:

## 🔧 Quick Fixes (Try These First)

### 1. **Clear Gradle Cache**
```bash
cd android
./gradlew clean
./gradlew --stop
```

On Windows:
```powershell
cd android
.\gradlew.bat clean
.\gradlew.bat --stop
```

### 2. **Delete Gradle Cache Folders**
Delete these folders to force fresh downloads:
- `~/.gradle/caches/` (Linux/Mac)
- `C:\Users\YourUsername\.gradle\caches\` (Windows)
- `android/.gradle/` (project-specific cache)

### 3. **Check Internet Connection**
- Ensure stable internet connection
- Try accessing https://maven.google.com in browser
- Check if firewall/proxy is blocking Gradle

### 4. **Use Offline Mode (If You Have Dependencies Cached)**
```bash
./gradlew build --offline
```

## 🌐 Network/Proxy Issues

### If Behind a Proxy:
1. Edit `android/gradle.properties` and uncomment proxy settings:
```properties
systemProp.http.proxyHost=your.proxy.com
systemProp.http.proxyPort=8080
systemProp.https.proxyHost=your.proxy.com
systemProp.https.proxyPort=8080
```

### If Using VPN:
- Try disconnecting VPN temporarily
- Some VPNs block Maven repositories

## 🔄 Alternative Solutions

### 1. **Use Gradle Wrapper with Updated Version**
Check `android/gradle/wrapper/gradle-wrapper.properties` and ensure it uses a stable version:
```properties
distributionUrl=https\://services.gradle.org/distributions/gradle-8.3-all.zip
```

### 2. **Manually Download Dependencies**
If specific dependencies fail:
1. Check error log for exact dependency name
2. Download manually from Maven Central
3. Place in local Maven repository

### 3. **Use Local Maven Repository**
If you have dependencies on another PC:
1. Copy `~/.gradle/caches/` from working PC
2. Paste to same location on new PC
3. Run `./gradlew build`

## 🛠️ Advanced Fixes

### 1. **Increase Timeout Values**
Already configured in `gradle.properties`:
```properties
systemProp.org.gradle.internal.http.connectionTimeout=120000
systemProp.org.gradle.internal.http.socketTimeout=120000
```

### 2. **Disable Gradle Update Checks**
Already configured:
```properties
org.gradle.warning.mode=none
```

### 3. **Use Mirror Repositories**
If Google/Maven Central is blocked, use mirrors:
- Aliyun Maven: `https://maven.aliyun.com/repository/public`
- JitPack: `https://www.jitpack.io`

### 4. **Check Android SDK Manager**
Ensure Android SDK is properly installed:
```bash
# Check Android SDK location
echo $ANDROID_HOME  # Linux/Mac
echo %ANDROID_HOME%  # Windows

# Update SDK components
sdkmanager --update
```

## 📋 Step-by-Step Troubleshooting

1. **Check Error Details**
   - Look for specific dependency/URL in error message
   - Note which repository failed (Google, Maven Central, etc.)

2. **Test Repository Access**
   ```bash
   # Test Google Maven
   curl https://maven.google.com
   
   # Test Maven Central
   curl https://repo1.maven.org/maven2
   ```

3. **Clean and Rebuild**
   ```bash
   cd android
   ./gradlew clean
   rm -rf .gradle build app/build
   ./gradlew build
   ```

4. **Check Gradle Version**
   ```bash
   ./gradlew --version
   ```
   Ensure it matches the wrapper version

5. **Verify Network Settings**
   - Check DNS settings
   - Try different network (mobile hotspot)
   - Disable antivirus/firewall temporarily

## 🔍 Common Causes

1. **Firewall/Antivirus**: Blocking Gradle downloads
2. **Corporate Proxy**: Requires authentication
3. **DNS Issues**: Can't resolve repository URLs
4. **Corrupted Cache**: Old/incomplete downloads
5. **Network Timeout**: Slow connection timing out
6. **Repository Down**: Temporary service outage

## ✅ Verification

After applying fixes, verify with:
```bash
cd android
./gradlew tasks --refresh-dependencies
```

If successful, you should see all tasks listed without errors.

## 🆘 Still Having Issues?

1. **Compare with Working PC**:
   - Check `gradle.properties` differences
   - Compare Gradle versions
   - Check environment variables

2. **Check Logs**:
   - Look in `android/.gradle/` for detailed logs
   - Check `~/.gradle/daemon/` for daemon logs

3. **Use Gradle Debug Mode**:
   ```bash
   ./gradlew build --debug --stacktrace
   ```
   This provides detailed error information

## 📝 Additional Notes

- The `gradle.properties` file has been updated with network timeout and retry configurations
- Repository configurations have been enhanced with fallback mirrors
- Offline mode can be used if dependencies are already cached

