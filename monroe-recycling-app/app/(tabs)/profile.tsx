import { StyleSheet, Pressable, Text, TextInput, Modal, ScrollView, Switch, ActivityIndicator, Linking } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useThemeContext } from '@/contexts/theme-context';
import { SKILL_ID } from '@/constants/config';
import { fetchMobileHelp, type MobileHelpItem } from '@/services/mobileHelp';
import { signupNewsletter } from '@/services/newsletterSignup';

const LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'es', label: 'Spanish' },
  { id: 'it', label: 'Italian' },
] as const;

type LanguageId = (typeof LANGUAGES)[number]['id'];

export default function Profile() {
  const { theme, toggleTheme } = useThemeContext();
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [newsletterModalVisible, setNewsletterModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageId>('en');
  const [mobileHelp, setMobileHelp] = useState<MobileHelpItem | null>(null);
  const [helpLoading, setHelpLoading] = useState(false);
  const [helpError, setHelpError] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSaving, setNewsletterSaving] = useState(false);
  const [newsletterError, setNewsletterError] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState('');
  const backgroundColor = useThemeColor({}, 'background');
  const insets = useSafeAreaInsets();
  // TopBar is insets.top + 50; add extra gap below it
  const contentPaddingTop = insets.top + 50 + 40;

  async function openHelpModal() {
    setHelpModalVisible(true);
    setHelpLoading(true);
    setHelpError('');
    try {
      const entry = await fetchMobileHelp(SKILL_ID);
      setMobileHelp(entry);
      if (!entry) {
        setHelpError('Help contact information is not available.');
      }
    } catch (err) {
      console.error(err);
      setMobileHelp(null);
      setHelpError('Failed to load help information.');
    } finally {
      setHelpLoading(false);
    }
  }

  function openNewsletterModal() {
    setNewsletterEmail('');
    setNewsletterError('');
    setNewsletterSuccess('');
    setNewsletterModalVisible(true);
  }

  async function handleNewsletterSignup() {
    const email = newsletterEmail.trim();
    if (!email) {
      setNewsletterError('Please enter your email address.');
      setNewsletterSuccess('');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNewsletterError('Please enter a valid email address.');
      setNewsletterSuccess('');
      return;
    }

    setNewsletterSaving(true);
    setNewsletterError('');
    setNewsletterSuccess('');
    try {
      await signupNewsletter(SKILL_ID, email);
      setNewsletterSuccess('Thanks! You are signed up for the newsletter.');
      setNewsletterEmail('');
    } catch (err) {
      console.error(err);
      setNewsletterError(
        err instanceof Error ? err.message : 'Failed to sign up. Please try again.'
      );
    } finally {
      setNewsletterSaving(false);
    }
  }

  return (
    <ThemedView style={{ flex: 1, backgroundColor }}>
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: contentPaddingTop }]}>
        <ThemedView style={styles.titleContainer}>
          <MyButton
            title="Language"
            icon="globe-outline"
            onPress={() => setLanguageModalVisible(true)}
          />
        </ThemedView>

        <Modal
          visible={languageModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setLanguageModalVisible(false)}
        >
          <ThemedView style={styles.modalBackground}>
            <ThemedView style={styles.modalBox}>
              <ThemedText type="subtitle">
                Language
              </ThemedText>

              <ThemedView style={styles.languageList}>
                {LANGUAGES.map((language) => {
                  const isSelected = selectedLanguage === language.id;
                  return (
                    <Pressable
                      key={language.id}
                      style={[
                        styles.languageOption,
                        isSelected && styles.languageOptionSelected,
                      ]}
                      onPress={() => setSelectedLanguage(language.id)}
                    >
                      <ThemedText
                        style={styles.languageOptionText}
                        lightColor="#12304A"
                        darkColor="#12304A"
                      >
                        {language.label}
                      </ThemedText>
                      <Ionicons
                        name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                        size={22}
                        color="#12304A"
                      />
                    </Pressable>
                  );
                })}
              </ThemedView>

              <Pressable
                style={styles.closeButton}
                onPress={() => setLanguageModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </Pressable>
            </ThemedView>
          </ThemedView>
        </Modal>


        <ThemedView style={styles.titleContainer}>
          <MyButton
            title="Theme"
            icon="contrast-outline"
            onPress={() => setThemeModalVisible(true)}
          />
        </ThemedView>

        <Modal
          visible={themeModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setThemeModalVisible(false)}
        >
          <ThemedView style={styles.modalBackground}>
            <ThemedView style={styles.modalBox}>
              <ThemedText type="subtitle">
                Theme
              </ThemedText>

              <ThemedView style={styles.settingRow}>
                <ThemedText>Dark Mode</ThemedText>

                <Switch
                  value={theme === 'dark'}
                  onValueChange={toggleTheme}
                />
              </ThemedView>

              <Pressable
                style={styles.closeButton}
                onPress={() => setThemeModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </Pressable>
            </ThemedView>
          </ThemedView>
        </Modal>

        <ThemedView style={styles.titleContainer}>
          <MyButton
            title="Help"
            icon="help-circle-outline"
            onPress={openHelpModal}
          />
        </ThemedView>

        <Modal
          visible={helpModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setHelpModalVisible(false)}
        >
          <ThemedView style={styles.modalBackground}>
            <ThemedView style={styles.modalBox}>
              <ThemedText type="subtitle">
                Help
              </ThemedText>

              {helpLoading ? (
                <ActivityIndicator
                  style={styles.helpLoading}
                  color="#12304A"
                />
              ) : helpError ? (
                <ThemedText style={styles.helpBody}>{helpError}</ThemedText>
              ) : (
                <ThemedView style={styles.helpDetails}>
                  {mobileHelp?.title?.trim() ? (
                    <ThemedText style={styles.helpBody}>
                      {mobileHelp.title}
                    </ThemedText>
                  ) : null}
                  {mobileHelp?.phone?.trim() ? (
                    <Pressable
                      onPress={() =>
                        Linking.openURL(
                          `tel:${mobileHelp.phone!.replace(/[^\d+]/g, '')}`
                        )
                      }
                    >
                      <ThemedText style={styles.helpBody}>
                        {mobileHelp.phone}
                      </ThemedText>
                    </Pressable>
                  ) : null}
                  {mobileHelp?.email?.trim() ? (
                    <Pressable
                      onPress={() =>
                        Linking.openURL(`mailto:${mobileHelp.email!.trim()}`)
                      }
                    >
                      <ThemedText style={styles.helpBody}>
                        {mobileHelp.email}
                      </ThemedText>
                    </Pressable>
                  ) : null}
                </ThemedView>
              )}

              <Pressable
                style={styles.closeButton}
                onPress={() => setHelpModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </Pressable>
            </ThemedView>
          </ThemedView>
        </Modal>

        <ThemedView style={styles.titleContainer}>
          <MyButton
            title="Newsletter Signup"
            icon="mail-outline"
            onPress={openNewsletterModal}
          />
        </ThemedView>

        <Modal
          visible={newsletterModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setNewsletterModalVisible(false)}
        >
          <ThemedView style={styles.modalBackground}>
            <ThemedView style={styles.modalBox}>
              <ThemedText type="subtitle">
                Newsletter Signup
              </ThemedText>

              <ThemedView style={styles.newsletterForm}>
                <TextInput
                  style={styles.newsletterInput}
                  value={newsletterEmail}
                  onChangeText={setNewsletterEmail}
                  placeholder="Email address"
                  placeholderTextColor="#6B7C8A"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  editable={!newsletterSaving}
                />
                {newsletterError ? (
                  <ThemedText style={styles.newsletterError}>
                    {newsletterError}
                  </ThemedText>
                ) : null}
                {newsletterSuccess ? (
                  <ThemedText style={styles.newsletterSuccess}>
                    {newsletterSuccess}
                  </ThemedText>
                ) : null}
                <ThemedView style={styles.newsletterButtonRow}>
                  <Pressable
                    style={[
                      styles.closeButton,
                      styles.newsletterRowButton,
                      newsletterSaving && styles.newsletterSubmitDisabled,
                    ]}
                    onPress={handleNewsletterSignup}
                    disabled={newsletterSaving}
                  >
                    <Text style={styles.closeButtonText}>
                      {newsletterSaving ? 'Saving...' : 'Save'}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.closeButton, styles.newsletterRowButton]}
                    onPress={() => setNewsletterModalVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </Pressable>
                </ThemedView>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </Modal>

      </ScrollView>
    </ThemedView>
  );
}

export function MyButton({ title, icon, onPress }: {
  title: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.button}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={20}
        color="#12304A"
      />

      <Text style={styles.buttonText}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 32,
    gap: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  settingRow: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  languageList: {
    marginTop: 16,
    gap: 8,
    width: '100%',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#F3F7FA',
  },
  languageOptionSelected: {
    borderColor: '#12304A',
    backgroundColor: '#A1D7F8',
  },
  languageOptionText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  helpLoading: {
    marginTop: 20,
  },
  helpDetails: {
    marginTop: 20,
    gap: 10,
    width: '100%',
  },
  helpBody: {
    fontSize: 16,
  },
  newsletterForm: {
    marginTop: 20,
    width: '100%',
    gap: 12,
  },
  newsletterInput: {
    borderWidth: 1,
    borderColor: '#C5D0D8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#12304A',
    backgroundColor: '#FFFFFF',
  },
  newsletterError: {
    fontSize: 14,
    color: '#9D1416',
  },
  newsletterSuccess: {
    fontSize: 14,
    color: '#27704D',
  },
  newsletterButtonRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 8,
  },
  newsletterRowButton: {
    flex: 1,
    marginTop: 0,
  },
  newsletterSubmitDisabled: {
    opacity: 0.6,
  },
  button: {
    backgroundColor: '#A1D7F8',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "flex-start",
    marginBottom: 15,
    width: "100%",
  },
  buttonText: {
    color: '#12304A',
    fontSize: 16,
    marginLeft: 10,
    fontWeight: "bold",
  },
  modalBackground:{
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox:{
    width: "85%",
    padding: 20,
    borderRadius: 15,
  },
  closeButton:{
    backgroundColor: "#A1D7F8",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  closeButtonText:{
    color: "#12304A",
    fontWeight: "bold",
    fontSize: 16,
  }
});
