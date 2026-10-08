package com.neuroplay.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
import android.os.Bundle;
import android.webkit.WebSettings;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        WebSettings settings = this.bridge.getWebView().getSettings();
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    "neuroplay_monitor",
                    "NeuroPlay Monitoring",
                    NotificationManager.IMPORTANCE_LOW
            );

            channel.setDescription("Silent monitoring notification");
            channel.enableVibration(false);
            channel.setSound(null, null);

            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(channel);

        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel alertChannel = new NotificationChannel(
                    "neuroplay_alerts",
                    "NeuroPlay Alerts",
                    NotificationManager.IMPORTANCE_HIGH
            );

            alertChannel.setDescription("Stress alerts");

            NotificationManager manager =
                    getSystemService(NotificationManager.class);

            manager.createNotificationChannel(alertChannel);
        }
    }
}